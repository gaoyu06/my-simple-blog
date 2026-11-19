import { listPublishedArticles } from "@/server/queries/articles";
import { getSiteMeta } from "@/server/queries/site";

export const revalidate = 3600;

const escape = (s: string) =>
  s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c]!);

export async function GET() {
  const base = process.env.APP_URL ?? "http://localhost:3000";
  const [meta, articles] = await Promise.all([getSiteMeta(), listPublishedArticles({ take: 30 })]);
  const items = articles
    .map(
      (a) => `<item>
<title>${escape(a.title)}</title>
<link>${base}/articles/${a.slug}</link>
<guid>${base}/articles/${a.slug}</guid>
${a.publishedAt ? `<pubDate>${a.publishedAt.toUTCString()}</pubDate>` : ""}
${a.summary ? `<description>${escape(a.summary)}</description>` : ""}
</item>`,
    )
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>${escape(meta.name)}</title>
<link>${base}</link>
<description>${escape(meta.description || meta.name)}</description>
<language>zh-CN</language>
${items}
</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
