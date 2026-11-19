import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import readingTime from "reading-time";

const apply = process.argv.includes("--apply");
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

function isTableSeparator(line) {
  return /^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}
function isTableRow(line) {
  return /^\s*\|.*\|\s*$/.test(line);
}
function removeTableBlankLines(lines) {
  const result = [...lines];
  for (let i = 0; i < result.length; i++) {
    if (!isTableRow(result[i])) continue;
    let separator = i + 1;
    while (separator < result.length && result[separator].trim() === "") separator++;
    if (!isTableSeparator(result[separator] ?? "")) continue;
    let end = separator + 1;
    while (end < result.length) {
      if (isTableRow(result[end])) { end++; continue; }
      if (result[end].trim() === "") {
        let next = end + 1;
        while (next < result.length && result[next].trim() === "") next++;
        if (isTableRow(result[next] ?? "")) { end = next + 1; continue; }
      }
      break;
    }
    const block = result.slice(i, end).filter((line) => line.trim() !== "");
    result.splice(i, end - i, ...block);
    i += block.length - 1;
  }
  return result;
}

function normalizeMarkdown(md) {
  const lines = md.replace(/\r\n?/g, "\n").split("\n");
  const output = [];
  let inFence = false;
  let fenceChar = "";
  for (const originalLine of lines) {
    let line = originalLine;
    const fence = line.trimStart().match(/^(`{3,}|~{3,})/);
    if (fence) {
      const marker = fence[1][0];
      if (!inFence) { inFence = true; fenceChar = marker; }
      else if (marker === fenceChar) { inFence = false; fenceChar = ""; }
      output.push(line);
      continue;
    }
    if (!inFence) {
      line = line.replace(/^([ \t]*)\*>\s?/, "$1> ");
      line = line.replace(/^([ \t]*)\\(#{1,6})(?=\s)/, "$1$2");
      line = line.replace(/^([ \t]*)\\(-{3,})(?=\s|$)/, "$1$2");
      line = line.replace(/^([ \t]*)(\d+)\\\.(?=\s)/, "$1$2.");
      line = line.replace(/\*\*\*\*(.+?)\*\*\*\*/g, "**$1**");
      line = line.replace(/\\([\\`*_\[\]{}()#+.!>~-])/g, "$1");
      line = line.replace(/&(?:amp|gt|lt|quot|#39|apos|nbsp);/g, (entity) => ({
        "&amp;": "&", "&gt;": ">", "&lt;": "<", "&quot;": '"',
        "&#39;": "'", "&apos;": "'", "&nbsp;": " ",
      }[entity] ?? entity));
    }
    output.push(line);
  }
  return removeTableBlankLines(output).join("\n");
}

function extractExcerpt(md, max = 220) {
  const cleaned = normalizeMarkdown(md)
    .replace(/^---[\s\S]*?\n---\s*\n?/, "")
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
    .replace(/\*{1,3}|_{1,3}|~{2}/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.length <= max ? cleaned : cleaned.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

async function renderMarkdown(md) {
  const file = await unified().use(remarkParse).use(remarkGfm).use(remarkBreaks)
    .use(remarkRehype, { allowDangerousHtml: true }).use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: "wrap", properties: { className: ["anchor"] } })
    .use(rehypePrettyCode, { theme: { light: "github-light", dark: "github-dark-dimmed" }, keepBackground: false })
    .use(rehypeStringify, { allowDangerousHtml: true }).process(normalizeMarkdown(md));
  return String(file);
}
function structure(html) {
  return {
    headings: (html.match(/<h[1-6]\b/g) ?? []).length,
    tables: (html.match(/<table\b/g) ?? []).length,
    quotes: (html.match(/<blockquote\b/g) ?? []).length,
    code: (html.match(/<pre\b/g) ?? []).length,
  };
}
function suspicious(value) {
  return ["&gt;", "\\##", "|---|", "****", "*>"].filter((needle) => value.includes(needle));
}

async function main() {
  const [articles, pages] = await Promise.all([
    db.article.findMany({ select: { id: true, slug: true, title: true, contentMd: true, contentHtml: true, summary: true, readingTime: true }, orderBy: { slug: "asc" } }),
    db.page.findMany({ where: { contentType: "MARKDOWN" }, select: { id: true, slug: true, title: true, content: true, contentHtml: true }, orderBy: { slug: "asc" } }),
  ]);
  const report = { apply, articles: [], pages: [] };
  for (const item of articles) {
    const contentMd = normalizeMarkdown(item.contentMd);
    const contentHtml = await renderMarkdown(contentMd);
    const summary = extractExcerpt(contentMd);
    const nextReadingTime = Math.max(1, Math.round(readingTime(contentMd).minutes));
    const changed = contentMd !== item.contentMd || contentHtml !== item.contentHtml || summary !== item.summary || nextReadingTime !== item.readingTime;
    report.articles.push({ slug: item.slug, changed, summaryBefore: item.summary, summaryAfter: summary, structure: structure(contentHtml), suspicious: suspicious(contentMd) });
    if (apply && changed) await db.article.update({ where: { id: item.id }, data: { contentMd, contentHtml, summary, readingTime: nextReadingTime } });
  }
  for (const item of pages) {
    const content = normalizeMarkdown(item.content);
    const contentHtml = await renderMarkdown(content);
    const changed = content !== item.content || contentHtml !== item.contentHtml;
    report.pages.push({ slug: item.slug, changed, structure: structure(contentHtml), suspicious: suspicious(content) });
    if (apply && changed) await db.page.update({ where: { id: item.id }, data: { content, contentHtml } });
  }
  console.log(JSON.stringify(report, null, 2));
}
main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => db.$disconnect());
