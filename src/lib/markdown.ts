import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import remarkCjkFriendly from "remark-cjk-friendly";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import readingTimeLib from "reading-time";
import slugifyLib from "slugify";

export function normalizeMarkdown(md: string): string {
  const lines = md.replace(/\r\n?/g, "\n").split("\n");
  const output: string[] = [];
  let inFence = false;
  let fenceChar = "";

  let fenceBody: string[] = [];

  for (const originalLine of lines) {
    let line = originalLine;
    const trimmed = line.trimStart();
    const fence = trimmed.match(/^(`{3,}|~{3,})/);
    if (fence) {
      const marker = fence[1][0];
      if (!inFence) {
        inFence = true;
        fenceChar = marker;
        fenceBody = [];
      } else if (marker === fenceChar) {
        inFence = false;
        fenceChar = "";
        output.push(...repairFenceBody(fenceBody));
      }
      output.push(line);
      continue;
    }
    if (inFence) {
      fenceBody.push(line);
      continue;
    }

    if (!inFence) {
      line = line.replace(/^([ \t]*)\*>\s?/, "$1> ");
      line = line.replace(/^([ \t]*)\\(#{1,6})(?=\s)/, "$1$2");
      line = line.replace(/^([ \t]*)\\(-{3,})(?=\s|$)/, "$1$2");
      line = line.replace(/^([ \t]*)(\d+)\.(?=\s)/, "$1$2.");
      line = line.replace(/\*\*\*\*(.+?)\*\*\*\*/g, "**$1**");
      line = line.replace(/\\([\\`*_\[\]{}()#+.!>~-])/g, "$1");
      line = line.replace(/&(?:amp|gt|lt|quot|#39|apos|nbsp);/g, (entity) => ({
        "&amp;": "&", "&gt;": ">", "&lt;": "<", "&quot;": '"',
        "&#39;": "'", "&apos;": "'", "&nbsp;": " ",
      }[entity] ?? entity));
    }
    output.push(line);
  }

  if (inFence) output.push(...fenceBody);
  return removeMarkdownTableBlankLines(output).join("\n");
}

/**
 * Code pasted through the rich-text editor comes back with a blank line after
 * every line and non-breaking spaces for indentation. Undo both, but only when
 * the whole block follows that pattern so real blank lines survive.
 */
export function repairFenceBody(body: string[]): string[] {
  const lines = body.map((l) => l.replace(/\u00a0/g, " "));
  while (lines.length && lines[lines.length - 1].trim() === "") lines.pop();
  while (lines.length && lines[0].trim() === "") lines.shift();
  const doubled =
    lines.length >= 3 && lines.every((l, i) => (i % 2 === 1 ? l.trim() === "" : true)) &&
    lines.some((l, i) => i % 2 === 0 && l.trim() !== "");
  return doubled ? lines.filter((_, i) => i % 2 === 0) : lines;
}

function isTableSeparator(line: string): boolean {
  return /^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

function isTableRow(line: string): boolean {
  return /^\s*\|.*\|\s*$/.test(line);
}

function removeMarkdownTableBlankLines(lines: string[]): string[] {
  const result = [...lines];
  for (let i = 0; i < result.length; i++) {
    if (!isTableRow(result[i]) || result[i + 1] === undefined) continue;
    let separator = i + 1;
    while (separator < result.length && result[separator].trim() === "") separator++;
    if (!isTableSeparator(result[separator] ?? "")) continue;

    let end = separator + 1;
    while (end < result.length) {
      if (isTableRow(result[end])) {
        end++;
        continue;
      }
      if (result[end].trim() === "") {
        let next = end + 1;
        while (next < result.length && result[next].trim() === "") next++;
        if (isTableRow(result[next] ?? "")) {
          end = next + 1;
          continue;
        }
      }
      break;
    }
    const block = result.slice(i, end).filter((line) => line.trim() !== "");
    result.splice(i, end - i, ...block);
    i += block.length - 1;
  }
  return result;
}

export type Heading = { id: string; text: string; depth: 2 | 3 };

type HastNode = {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

function textOf(node: HastNode): string {
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(textOf).join("");
}

function walk(node: HastNode, fn: (n: HastNode) => void) {
  fn(node);
  for (const child of node.children ?? []) walk(child, fn);
}

const IMAGE_WIDTHS = [640, 1080, 1920];

function optimizedUrl(src: string, width: number): string {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75`;
}

/**
 * Lazy-load images and route local uploads through the Next image optimizer
 * (WebP/AVIF, resized). Also collects h2/h3 for the table of contents.
 */
function rehypeArticleExtras(headings: Heading[]) {
  return () => (tree: HastNode) => {
    walk(tree, (node) => {
      if (node.type !== "element") return;
      if (node.tagName === "img" && node.properties) {
        const src = String(node.properties.src ?? "");
        node.properties.loading = "lazy";
        node.properties.decoding = "async";
        if (src.startsWith("/uploads/") && !/\.(svg|gif)$/i.test(src)) {
          node.properties.src = optimizedUrl(src, 1080);
          node.properties.srcSet = IMAGE_WIDTHS.map((w) => `${optimizedUrl(src, w)} ${w}w`).join(", ");
          node.properties.sizes = "(max-width: 760px) 100vw, 720px";
        }
      }
      if ((node.tagName === "h2" || node.tagName === "h3") && node.properties?.id) {
        headings.push({
          id: String(node.properties.id),
          text: textOf(node).trim(),
          depth: node.tagName === "h2" ? 2 : 3,
        });
      }
    });
  };
}

/**
 * Markdown → HTML. `allowHtml` keeps raw HTML blocks and must only be used
 * for content written by authors, never for visitor input such as comments.
 */
export async function renderMarkdown(
  md: string,
  { allowHtml = true }: { allowHtml?: boolean } = {},
): Promise<string> {
  return (await renderArticle(md, { allowHtml })).html;
}

export async function renderArticle(
  md: string,
  { allowHtml = true }: { allowHtml?: boolean } = {},
): Promise<{ html: string; headings: Heading[] }> {
  const headings: Heading[] = [];
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    // CJK punctuation next to ** breaks CommonMark emphasis; this restores it.
    .use(remarkCjkFriendly)
    .use(remarkBreaks)
    .use(remarkRehype, { allowDangerousHtml: allowHtml })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: "wrap",
      properties: { className: ["anchor"] },
    })
    .use(rehypePrettyCode, {
      theme: { light: "github-light", dark: "github-dark-dimmed" },
      keepBackground: false,
    })
    .use(rehypeArticleExtras(headings))
    .use(rehypeStringify, { allowDangerousHtml: allowHtml })
    .process(normalizeMarkdown(md));
  return { html: String(file), headings };
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
  const withoutFrontmatter = normalizeMarkdown(md).replace(/^---[\s\S]*?\n---\s*\n?/, "");
  const cleaned = withoutFrontmatter
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^\s*!\[[^\]]*\]\([^)]*\)\s*$/gm, " ")
    .replace(/^\s*\|.*\|\s*$/gm, " ")
    .replace(/(?:^|\s)(?:声明|注意|写在前面)\s*[:：][^。！？!?\n]*[。！？!?]?/g, " ")
    .replace(/^\s{0,3}#{1,6}\s+.*$/gm, " ")
    .replace(/^\s*(?:[-+*]|\d+[.)])\s+/gm, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\\([\\`*_[\]{}()#+.!>~-])/g, "$1")
    .replace(/\*{1,3}|_{1,3}|~{2}/g, "")
    .replace(/&(?:amp|gt|lt|quot|#39|apos|nbsp);/g, (entity) => {
      const values: Record<string, string> = {
        "&amp;": "&",
        "&gt;": ">",
        "&lt;": "<",
        "&quot;": '"',
        "&#39;": "'",
        "&apos;": "'",
        "&nbsp;": " ",
      };
      return values[entity] ?? entity;
    })
    .replace(/\s+/g, " ")
    .trim();
  if (cleaned.length <= max) return cleaned;
  return cleaned.slice(0, max).replace(/\s+\S*$/, "") + "…";
}
