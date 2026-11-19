import "server-only";
import { db } from "@/lib/db";
import { extractExcerpt } from "@/lib/markdown";

const isPostgres = /^postgres(ql)?:\/\//i.test(process.env.DATABASE_URL ?? "");

/**
 * Substring search over title, summary and body. Returns a plain-text
 * snippet around the first body match.
 * ponytail: LIKE scan, fine for hundreds of posts; switch to pg_trgm or a
 * search index if the archive grows into the thousands.
 */
export async function searchArticles(q: string, limit = 50) {
  const query = q.trim().slice(0, 100);
  if (!query) return [];
  const contains = isPostgres ? { contains: query, mode: "insensitive" as const } : { contains: query };

  const rows = await db.article.findMany({
    where: {
      status: "PUBLISHED",
      OR: [{ title: contains }, { summary: contains }, { contentMd: contains }],
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
    select: { id: true, slug: true, title: true, summary: true, publishedAt: true, contentMd: true },
  });

  return rows.map(({ contentMd, ...a }) => {
    const text = extractExcerpt(contentMd, 100_000);
    const at = text.toLowerCase().indexOf(query.toLowerCase());
    const snippet =
      at < 0 ? (a.summary ?? "") : `${at > 40 ? "…" : ""}${text.slice(Math.max(0, at - 40), at + query.length + 80)}…`;
    return { ...a, snippet };
  });
}
