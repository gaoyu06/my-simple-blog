import "server-only";
import { getPageBySlug } from "@/server/queries/taxonomy";

export type Work = {
  name: string;
  href: string;
  /** "2026.09 – 2026.10" or "2025.12 – 至今" */
  range: string;
  kind: string;
  stack: string;
  summary: string;
  ongoing: boolean;
};

/**
 * Works live in the "works" page (edited in the admin) as repeated blocks:
 *
 *   ### [Name](/slug)
 *   <span ...>2026.09 – 2026.10 · 比赛作品 · Python、Playwright</span><br>
 *   One-paragraph summary.
 */
const BLOCK = /^### \[(.+?)\]\((.+?)\)\s*\n<span[^>]*>(.+?)<\/span>(?:<br\s*\/?>)?\s*\n(.+)$/gm;

export async function listWorks(): Promise<Work[]> {
  const page = await getPageBySlug("works");
  if (!page?.published) return [];
  return [...page.content.matchAll(BLOCK)].map(([, name, href, meta, summary]) => {
    const [range = "", kind = "", stack = ""] = meta.split(" · ").map((s) => s.trim());
    return { name, href, range, kind, stack, summary: summary.trim(), ongoing: range.includes("至今") };
  });
}
