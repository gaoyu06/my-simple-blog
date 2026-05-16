import "server-only";
import { db } from "@/lib/db";

export async function listCategoriesWithCounts() {
  const cats = await db.category.findMany({ orderBy: [{ position: "asc" }, { name: "asc" }] });
  const counts = await db.article.groupBy({
    by: ["categoryId"],
    where: { status: "PUBLISHED" },
    _count: { _all: true },
  });
  const map = new Map(counts.map((c) => [c.categoryId, c._count._all]));
  return cats.map((c) => ({ ...c, articleCount: map.get(c.id) ?? 0 }));
}

export async function listTagsWithCounts() {
  const tags = await db.tag.findMany({ orderBy: { name: "asc" } });
  const counts = await db.articleTag.groupBy({
    by: ["tagId"],
    where: { article: { status: "PUBLISHED" } },
    _count: { _all: true },
  });
  const map = new Map(counts.map((c) => [c.tagId, c._count._all]));
  return tags
    .map((t) => ({ ...t, articleCount: map.get(t.id) ?? 0 }))
    .filter((t) => t.articleCount > 0);
}

export async function getCategoryBySlug(slug: string) {
  return db.category.findUnique({ where: { slug } });
}

export async function getTagBySlug(slug: string) {
  return db.tag.findUnique({ where: { slug } });
}

export async function getPageBySlug(slug: string) {
  return db.page.findUnique({ where: { slug } });
}

export async function listPublishedPages() {
  return db.page.findMany({
    where: { published: true },
    orderBy: { position: "asc" },
  });
}
