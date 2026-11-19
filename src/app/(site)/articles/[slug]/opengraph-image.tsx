import { ImageResponse } from "next/og";
import { formatDate } from "@/lib/date";

import { loadGoogleFont } from "@/lib/og-fonts";
import { getArticleBySlug } from "@/server/queries/articles";
import { getSiteMeta } from "@/server/queries/site";

// Rendered on first request, then cached until content changes.
export function generateStaticParams() {
  return [];
}

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "文章分享图";

/** Share card: title, site name and date. Only used by link previews. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [article, meta] = await Promise.all([getArticleBySlug(slug), getSiteMeta()]);
  const title = article?.title ?? meta.name;
  const date = article?.publishedAt ? formatDate(article.publishedAt) : "";
  const category = article?.category?.name ?? "";
  const footer = [date, category].filter(Boolean).join("  ·  ");
  const text = `${title}${meta.name}${footer}`;

  const [bold, regular] = await Promise.all([
    loadGoogleFont("Noto Sans SC", 700, "normal", text),
    loadGoogleFont("Noto Sans SC", 400, "normal", text),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 88px",
          background: "#fbfbfa",
          color: "#18181b",
          fontFamily: "Noto Sans SC",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, color: "#71717a" }}>{meta.name}</div>
        <div style={{ display: "flex", fontSize: title.length > 28 ? 60 : 72, fontWeight: 700, lineHeight: 1.25 }}>
          {title}
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#71717a" }}>{footer}</div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Noto Sans SC", data: bold, weight: 700, style: "normal" },
        { name: "Noto Sans SC", data: regular, weight: 400, style: "normal" },
      ],
    },
  );
}
