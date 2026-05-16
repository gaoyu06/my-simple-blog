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

export async function renderTemplateCover(
  template: TemplateKey,
  props: TemplateProps,
  options: RenderOptions = {},
): Promise<Buffer> {
  const factory = TEMPLATES[template];
  if (!factory) throw new Error(`Unknown cover template: ${template}`);

  const [fraunces, hanken] = await Promise.all([
    loadGoogleFont("Fraunces", 500, "normal").catch(() => loadGoogleFont("Fraunces", 500, "italic")),
    loadGoogleFont("Hanken Grotesk", 500, "normal"),
  ]);
  const [fraunceItalic] = await Promise.all([
    loadGoogleFont("Fraunces", 500, "italic").catch(() => fraunces),
  ]);

  const svg = await satori(factory(props), {
    width: options.width ?? 1200,
    height: options.height ?? 630,
    fonts: [
      { name: "Hanken Grotesk", data: hanken, weight: 500, style: "normal" },
      { name: "Fraunces", data: fraunces, weight: 500, style: "normal" },
      { name: "Fraunces", data: fraunceItalic, weight: 500, style: "italic" },
    ],
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: options.width ?? 1200 },
  });
  return Buffer.from(resvg.render().asPng());
}
