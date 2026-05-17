import "server-only";
import React from "react";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

import { loadGoogleFont } from "@/lib/cover/fonts";
import { MinimalGradient, type MinimalGradientProps } from "@/lib/cover/templates/minimal-gradient";
import { Editorial, type EditorialProps } from "@/lib/cover/templates/editorial";

export type TemplateKey = "minimal-gradient" | "editorial";

type TemplateProps = MinimalGradientProps | EditorialProps;

const TEMPLATES: Record<TemplateKey, (props: TemplateProps) => React.ReactElement> = {
  "minimal-gradient": (props) => <MinimalGradient {...(props as MinimalGradientProps)} />,
  editorial: (props) => <Editorial {...(props as EditorialProps)} />,
};

interface RenderOptions {
  width?: number;
  height?: number;
}

function collectText(props: TemplateProps): string {
  const parts = [
    props.title,
    "summary" in props ? props.summary : undefined,
    "eyebrow" in props ? props.eyebrow : undefined,
  ];
  // De-dup characters so the Google Fonts URL stays short even with long bodies.
  return Array.from(new Set(parts.filter(Boolean).join("").split(""))).join("");
}

function hasCjk(text: string): boolean {
  // CJK Unified Ideographs + extensions; covers Simplified/Traditional/Japanese kanji.
  return /[　-ヿ㐀-䶿一-鿿豈-﫿＀-￯]/.test(text);
}

export async function renderTemplateCover(
  template: TemplateKey,
  props: TemplateProps,
  options: RenderOptions = {},
): Promise<Buffer> {
  const factory = TEMPLATES[template];
  if (!factory) throw new Error(`Unknown cover template: ${template}`);

  const allText = collectText(props);

  const [fraunces, hanken] = await Promise.all([
    loadGoogleFont("Fraunces", 500, "normal").catch(() => loadGoogleFont("Fraunces", 500, "italic")),
    loadGoogleFont("Hanken Grotesk", 500, "normal"),
  ]);
  const fraunceItalic = await loadGoogleFont("Fraunces", 500, "italic").catch(() => fraunces);

  // Latin fonts have no CJK glyphs — pull in Noto Sans SC, subset to just the
  // characters used in this cover, so the request stays small.
  const noto = hasCjk(allText)
    ? await loadGoogleFont("Noto Sans SC", 500, "normal", allText).catch(() => null)
    : null;

  const fonts: Parameters<typeof satori>[1]["fonts"] = [
    { name: "Hanken Grotesk", data: hanken, weight: 500, style: "normal" },
    { name: "Fraunces", data: fraunces, weight: 500, style: "normal" },
    { name: "Fraunces", data: fraunceItalic, weight: 500, style: "italic" },
  ];
  if (noto) {
    // Listed last → Satori falls back per-character; Latin still uses Fraunces/Hanken.
    fonts.push({ name: "Noto Sans SC", data: noto, weight: 500, style: "normal" });
  }

  const svg = await satori(factory(props), {
    width: options.width ?? 1200,
    height: options.height ?? 630,
    fonts,
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: options.width ?? 1200 },
  });
  return Buffer.from(resvg.render().asPng());
}
