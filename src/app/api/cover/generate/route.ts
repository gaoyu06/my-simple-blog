import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { canWriteArticles, canEditArticle } from "@/lib/permissions";
import { renderTemplateCover, type TemplateKey } from "@/lib/cover/render";
import { saveCoverPng, downloadImageToLocal } from "@/lib/cover/storage";
import { generateImage } from "@/lib/ai/image";

export const runtime = "nodejs";

const bodySchema = z.object({
  styleId: z.string().optional(),
  template: z.string().optional(),
  title: z.string().min(1).max(200),
  summary: z.string().optional(),
  eyebrow: z.string().optional(),
  prompt: z.string().optional(),
  articleId: z.string().optional(),
  config: z.record(z.string(), z.unknown()).optional(),
});

function parseJson<T>(s: string | null | undefined, fallback: T): T {
  if (!s) return fallback;
  try {
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!canWriteArticles(session)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  let parsed;
  try {
    parsed = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  if (parsed.articleId) {
    const article = await db.article.findUnique({ where: { id: parsed.articleId } });
    if (article && !canEditArticle(session, article)) {
      return NextResponse.json({ error: "Not authorized." }, { status: 403 });
    }
  }

  let kind: "API" | "TEMPLATE" | "CODE" = "TEMPLATE";
  let source: { kind?: string; template?: TemplateKey; prompt?: string } = {};
  let config: Record<string, unknown> = {};

  if (parsed.styleId) {
    const style = await db.coverStyle.findUnique({ where: { id: parsed.styleId } });
    if (!style) return NextResponse.json({ error: "Style not found." }, { status: 404 });
    kind = style.kind;
    source = parseJson(style.source, {});
    config = { ...parseJson<Record<string, unknown>>(style.config, {}), ...(parsed.config ?? {}) };
  } else if (parsed.template) {
    kind = "TEMPLATE";
    source = { kind: "satori", template: parsed.template as TemplateKey };
    config = parsed.config ?? {};
  } else if (parsed.prompt) {
    kind = "API";
  }

  try {
    let url: string;
    if (kind === "API") {
      const promptBase = source.prompt ?? parsed.prompt;
      if (!promptBase) return NextResponse.json({ error: "No prompt provided." }, { status: 400 });
      const fullPrompt = promptBase
        .replace("{title}", parsed.title)
        .replace("{summary}", parsed.summary ?? "");
      const [imageUrl] = await generateImage(fullPrompt);
      if (!imageUrl) throw new Error("No image returned.");
      url = await downloadImageToLocal(imageUrl);
    } else if (kind === "TEMPLATE" || kind === "CODE") {
      const template = (source.template ?? "minimal-gradient") as TemplateKey;
      const buffer = await renderTemplateCover(
        template,
        {
          title: parsed.title,
          summary: parsed.summary,
          eyebrow: parsed.eyebrow,
          ...(config as Record<string, string>),
        },
        {
          width: typeof config.width === "number" ? config.width : 1200,
          height: typeof config.height === "number" ? config.height : 630,
        },
      );
      url = await saveCoverPng(buffer);
    } else {
      return NextResponse.json({ error: "Unknown cover kind." }, { status: 400 });
    }

    if (parsed.articleId) {
      await db.article.update({
        where: { id: parsed.articleId },
        data: { coverImage: url, coverStyleId: parsed.styleId ?? null },
      });
    }
    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
