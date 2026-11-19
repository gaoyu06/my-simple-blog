import "server-only";
import { db } from "@/lib/db";

const articleListSelect = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  coverImage: true,
  publishedAt: true,
  viewCount: true,
  readingTime: true,
  featured: true,
  author: { select: { id: true, name: true, username: true, image: true } },
  category: { select: { id: true, slug: true, name: true, translations: true } },
  tags: {
    include: { tag: { select: { id: true, slug: true, name: true, translations: true } } },
  },
} as const;

export type ArticleListItem = Awaited<ReturnType<typeof listPublishedArticles>>[number];

export async function listPublishedArticles(opts: { take?: number; skip?: number } = {}) {
  return db.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: articleListSelect,
    take: opts.take,
    skip: opts.skip ?? 0,
  });
}

export async function countPublishedArticles(): Promise<number> {
  return db.article.count({ where: { status: "PUBLISHED" } });
}

export async function getArticleBySlug(slug: string) {
  return db.article.findUnique({
    where: { slug },
    include: {
      author: { select: { id: true, name: true, username: true, image: true, bio: true } },
      category: { select: { id: true, slug: true, name: true, translations: true } },
      tags: {
        include: { tag: { select: { id: true, slug: true, name: true, translations: true } } },
      },
    },
  });
}

export async function listArticlesByCategory(slug: string, opts: { take?: number; skip?: number } = {}) {
  return db.article.findMany({
    where: { status: "PUBLISHED", category: { slug } },
    orderBy: { publishedAt: "desc" },
    select: articleListSelect,
    take: opts.take,
    skip: opts.skip ?? 0,
  });
}

export async function listArticlesByTag(slug: string, opts: { take?: number; skip?: number } = {}) {
  return db.article.findMany({
    where: { status: "PUBLISHED", tags: { some: { tag: { slug } } } },
    orderBy: { publishedAt: "desc" },
    select: articleListSelect,
    take: opts.take,
    skip: opts.skip ?? 0,
  });
}

export async function listFeaturedArticles(take = 3) {
  return db.article.findMany({
    where: { status: "PUBLISHED", featured: true },
    orderBy: { publishedAt: "desc" },
    select: articleListSelect,
    take,
  });
}

/** Every published article, newest first, with just what the archive shows. */
export async function listArchive() {
  return db.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: { id: true, slug: true, title: true, publishedAt: true },
  });
}

/** Neighbours by publish date, for the links under an article. */
export async function getAdjacentArticles(publishedAt: Date) {
  const select = { slug: true, title: true } as const;
  const [prev, next] = await Promise.all([
    db.article.findFirst({
      where: { status: "PUBLISHED", publishedAt: { lt: publishedAt } },
      orderBy: { publishedAt: "desc" },
      select,
    }),
    db.article.findFirst({
      where: { status: "PUBLISHED", publishedAt: { gt: publishedAt } },
      orderBy: { publishedAt: "asc" },
      select,
    }),
  ]);
  return { prev, next };
}
