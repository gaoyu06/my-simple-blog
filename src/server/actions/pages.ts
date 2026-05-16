"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { renderMarkdown } from "@/lib/markdown";
import { sanitizeRichHtml } from "@/lib/html-sanitize";

const pageSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(1).max(120).regex(/^[a-z0-9/-]+$/, "Lowercase letters, digits, '/' and '-' only"),
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional().nullable(),
  contentType: z.enum(["MARKDOWN", "HTML"]).default("MARKDOWN"),
  content: z.string().default(""),
  published: z.coerce.boolean().default(true),
  position: z.coerce.number().int().min(0).default(0),
});

export async function savePage(input: unknown) {
  const session = await auth();
  if (!isAdmin(session)) return { ok: false as const, error: "Not authorized." };
  const parsed = pageSchema.safeParse(input);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) fields[issue.path.join(".")] = issue.message;
    return { ok: false as const, error: "Validation failed.", fields };
  }
  const data = parsed.data;

  const contentHtml =
    data.contentType === "MARKDOWN" ? await renderMarkdown(data.content) : sanitizeRichHtml(data.content);

  if (data.id) {
    const conflict = await db.page.findFirst({ where: { slug: data.slug, NOT: { id: data.id } } });
    if (conflict) return { ok: false as const, error: "Slug already in use." };
    await db.page.update({
      where: { id: data.id },
      data: {
        slug: data.slug,
        title: data.title,
        description: data.description ?? null,
        contentType: data.contentType,
        content: data.content,
        contentHtml,
        published: data.published,
        position: data.position,
      },
    });
  } else {
    const conflict = await db.page.findFirst({ where: { slug: data.slug } });
    if (conflict) return { ok: false as const, error: "Slug already in use." };
    await db.page.create({
      data: {
        slug: data.slug,
        title: data.title,
        description: data.description ?? null,
        contentType: data.contentType,
        content: data.content,
        contentHtml,
        published: data.published,
        position: data.position,
      },
    });
  }

  revalidatePath(`/${data.slug}`);
  revalidatePath("/admin/pages");
  return { ok: true as const };
}

export async function deletePage(id: string) {
  const session = await auth();
  if (!isAdmin(session)) return { ok: false as const, error: "Not authorized." };
  const page = await db.page.findUnique({ where: { id } });
  if (!page) return { ok: false as const, error: "Page not found." };
  await db.page.delete({ where: { id } });
  revalidatePath(`/${page.slug}`);
  revalidatePath("/admin/pages");
  return { ok: true as const };
}
