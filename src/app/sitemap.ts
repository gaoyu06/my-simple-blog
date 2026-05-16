import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.APP_URL ?? "http://localhost:3000";
  const [articles, categories, tags, pages] = await Promise.all([
    db.article.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    }),
    db.category.findMany({ select: { slug: true, updatedAt: true } }),
    db.tag.findMany({ select: { slug: true } }),
    db.page.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/archive`, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/categories`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/tags`, changeFrequency: "weekly", priority: 0.5 },
  ];

  return [
    ...staticRoutes,
    ...articles.map((a) => ({
      url: `${base}/articles/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...categories.map((c) => ({
      url: `${base}/categories/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.4,
    })),
    ...tags.map((t) => ({
      url: `${base}/tags/${t.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.3,
    })),
    ...pages.map((p) => ({
      url: `${base}/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
