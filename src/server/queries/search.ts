import "server-only";
import { db } from "@/lib/db";

/**
 * Search articles by query.
 *
 * Uses SQLite FTS5 virtual table maintained via triggers (see migrations/20260516140000_fts).
 * Falls back to a LIKE query if FTS fails (e.g. on non-SQLite providers).
 */
export async function searchArticles(q: string, limit = 50) {
  const trimmed = q.trim();
  if (!trimmed) return [];

  type Row = {
    id: string;
    slug: string;
    title: string;
    summary: string | null;
    publishedAt: Date | null;
    readingTime: number;
    snippet: string;
  };

  const ftsQuery = trimmed
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((tok) => `${tok}*`)
    .join(" ");

  if (ftsQuery) {
    try {
      const rows = await db.$queryRawUnsafe<Row[]>(
        `SELECT a.id, a.slug, a.title, a.summary, a.publishedAt, a.readingTime,
                snippet("ArticleSearch", 2, '<mark>', '</mark>', '…', 24) AS snippet
         FROM "ArticleSearch" s
         JOIN "Article" a ON a.rowid = s.rowid
         WHERE "ArticleSearch" MATCH ?
           AND a.status = 'PUBLISHED'
         ORDER BY rank
         LIMIT ${Number(limit)}`,
        ftsQuery,
      );
      return rows;
    } catch {
      // fall through
    }
  }

  return (await db.article.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { title: { contains: trimmed } },
        { summary: { contains: trimmed } },
        { contentMd: { contains: trimmed } },
      ],
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
    select: {
      id: true,
      slug: true,
      title: true,
      summary: true,
      publishedAt: true,
      readingTime: true,
    },
  })).map((a) => ({ ...a, snippet: a.summary ?? "" }));
}
