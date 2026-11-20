import "server-only";
import { db } from "@/lib/db";
import { getPageBySlug } from "@/server/queries/taxonomy";

export type Work = {
  name: string;
  href: string;
  /** "2026.09 – 2026.10" or "2025.12 – 至今" */
  range: string;
  kind: string;
  stack: string;
  summary: string;
  /** First image on the work's own page, used as its cover. */
  cover: string | null;
};

/**
 * Works live in the "works" page (edited in the admin) as repeated blocks:
 *
 *   ### [Name](/slug)
 *   <span ...>2026.09 – 2026.10 · 比赛作品 · Python、Playwright</span><br>
 *   One-paragraph summary.
 */
const BLOCK = /^### \[(.+?)\]\((.+?)\)\s*\n<span[^>]*>(.+?)<\/span>(?:<br\s*\/?>)?\s*\n(.+)$/gm;

const FIRST_IMAGE = /!\[[^\]]*\]\(([^)\s]+)/;

export async function listWorks(): Promise<Work[]> {
  const page = await getPageBySlug("works");
  if (!page?.published) return [];
  const blocks = [...page.content.matchAll(BLOCK)];
  const slugs = blocks.map(([, , href]) => href.replace(/^\//, ""));
  const pages = await db.page.findMany({ where: { slug: { in: slugs }, published: true }, select: { slug: true, content: true } });
  const covers = new Map(pages.map((p) => [`/${p.slug}`, p.content.match(FIRST_IMAGE)?.[1] ?? null]));
  return blocks.map(([, name, href, meta, summary]) => {
    const [range = "", kind = "", stack = ""] = meta.split(" · ").map((s) => s.trim());
    return {
      name,
      href,
      range,
      kind,
      stack,
      summary: summary.trim(),
      cover: covers.get(href) ?? null,
    };
  });
}
