import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import readingTimeLib from "reading-time";
import slugifyLib from "slugify";

export async function renderMarkdown(md: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkBreaks)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: "wrap",
      properties: { className: ["anchor"] },
    })
    .use(rehypePrettyCode, {
      theme: { light: "github-light", dark: "github-dark-dimmed" },
      keepBackground: false,
    })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(md);
  return String(file);
}

export function getReadingTime(md: string): number {
  return Math.max(1, Math.round(readingTimeLib(md).minutes));
}

export function makeSlug(input: string): string {
  return slugifyLib(input, { lower: true, strict: true, trim: true });
}

/**
 * If the first non-empty line of the markdown is an H1 with text matching
 * the given title (case-insensitive), strip it. Used to avoid duplicating
 * the article title that's already shown as a separate <h1> above the body.
 */
export function stripLeadingTitle(md: string, title: string | null | undefined): string {
  if (!md || !title) return md;
  const lines = md.split("\n");
  let i = 0;
  while (i < lines.length && lines[i].trim() === "") i++;
  if (i >= lines.length) return md;
  const first = lines[i].trim();
  if (!first.startsWith("# ")) return md;
  const h1 = first.slice(2).trim().toLowerCase();
  if (h1 !== title.trim().toLowerCase()) return md;
  let j = i + 1;
  while (j < lines.length && lines[j].trim() === "") j++;
  return lines.slice(j).join("\n");
}

export function extractExcerpt(md: string, max = 220): string {
  const cleaned = md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (cleaned.length <= max) return cleaned;
  return cleaned.slice(0, max).replace(/\s+\S*$/, "") + "…";
}
