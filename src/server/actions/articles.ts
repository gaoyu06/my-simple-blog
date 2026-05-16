"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { canWriteArticles, canEditArticle } from "@/lib/permissions";
import { extractExcerpt, getReadingTime, makeSlug, renderMarkdown } from "@/lib/markdown";

const tagsSchema = z.array(z.string().min(1).max(40)).max(20);

const upsertSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required").max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, digits and dashes").optional(),
  summary: z.string().max(500).optional().nullable(),
  contentMd: z.string().default(""),
  coverImage: z.string().url().optional().nullable().or(z.literal("").transform(() => null)),
  coverStyleId: z.string().optional().nullable(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  categoryId: z.string().optional().nullable(),
  tags: tagsSchema.default([]),
  featured: z.coerce.boolean().default(false),
  allowComment: z.coerce.boolean().default(true),
});

export type ArticleResult =
  | { ok: true; id: string; slug: string }
  | { ok: false; error: string; fields?: Record<string, string> };

async function syncTags(articleId: string, tags: string[]) {
  await db.articleTag.deleteMany({ where: { articleId } });
  for (const name of tags) {
    const slug = makeSlug(name);
    if (!slug) continue;
    const tag = await db.tag.upsert({
      where: { slug },
      update: {},
      create: { slug, name },
    });
    await db.articleTag.create({ data: { articleId, tagId: tag.id } });
  }
}

export async function saveArticle(input: unknown): Promise<ArticleResult> {
  const session = await auth();
  if (!canWriteArticles(session)) return { ok: false, error: "Not authorized." };

  const parsed = upsertSchema.safeParse(input);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) fields[issue.path.join(".")] = issue.message;
    return { ok: false, error: "Validation failed", fields };
  }
  const data = parsed.data;
  const slug = data.slug ?? makeSlug(data.title);
  if (!slug) return { ok: false, error: "Could not derive a slug from the title." };

  const summary = data.summary ?? extractExcerpt(data.contentMd);
  const readingTime = getReadingTime(data.contentMd);
  const contentHtml = data.contentMd ? await renderMarkdown(data.contentMd) : "";

  const publishedAt =
    data.status === "PUBLISHED" ? new Date() : null;

  let article;
  if (data.id) {
    const existing = await db.article.findUnique({ where: { id: data.id } });
    if (!existing) return { ok: false, error: "Article not found." };
    if (!canEditArticle(session, existing)) return { ok: false, error: "Not authorized to edit." };

    const slugConflict = await db.article.findFirst({ where: { slug, NOT: { id: data.id } } });
    if (slugConflict) return { ok: false, error: "Slug already in use.", fields: { slug: "Already in use" } };

    article = await db.article.update({
      where: { id: data.id },
      data: {
        title: data.title,
        slug,
        summary,
        contentMd: data.contentMd,
        contentHtml,
        coverImage: data.coverImage ?? null,
        coverStyleId: data.coverStyleId ?? null,
        status: data.status,
        categoryId: data.categoryId ?? null,
        featured: data.featured,
        allowComment: data.allowComment,
        readingTime,
        publishedAt: existing.publishedAt ?? publishedAt,
      },
    });
    await db.revision.create({
      data: { articleId: article.id, title: data.title, contentMd: data.contentMd, summary },
    });
  } else {
    const slugConflict = await db.article.findFirst({ where: { slug } });
    if (slugConflict) return { ok: false, error: "Slug already in use.", fields: { slug: "Already in use" } };
    article = await db.article.create({
      data: {
        title: data.title,
        slug,
        summary,
        contentMd: data.contentMd,
        contentHtml,
        coverImage: data.coverImage ?? null,
        coverStyleId: data.coverStyleId ?? null,
        status: data.status,
        authorId: session!.user.id,
        categoryId: data.categoryId ?? null,
        featured: data.featured,
        allowComment: data.allowComment,
        readingTime,
        publishedAt,
      },
    });
  }

  await syncTags(article.id, data.tags);

  revalidatePath("/");
  revalidatePath("/archive");
  revalidatePath(`/articles/${article.slug}`);
  revalidatePath("/admin/articles");

  return { ok: true, id: article.id, slug: article.slug };
}

export async function deleteArticle(id: string): Promise<ArticleResult> {
  const session = await auth();
  const existing = await db.article.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "Article not found." };
  if (!canEditArticle(session, existing)) return { ok: false, error: "Not authorized." };
  await db.article.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/archive");
  revalidatePath("/admin/articles");
  return { ok: true, id, slug: existing.slug };
}

export async function publishArticle(id: string, publish: boolean): Promise<ArticleResult> {
  const session = await auth();
  const existing = await db.article.findUnique({ where: { id } });
  if (!existing) return { ok: false, error: "Article not found." };
  if (!canEditArticle(session, existing)) return { ok: false, error: "Not authorized." };
  await db.article.update({
    where: { id },
    data: {
      status: publish ? "PUBLISHED" : "DRAFT",
      publishedAt: publish ? existing.publishedAt ?? new Date() : null,
    },
  });
  revalidatePath("/");
  revalidatePath("/archive");
  revalidatePath(`/articles/${existing.slug}`);
  revalidatePath("/admin/articles");
  return { ok: true, id, slug: existing.slug };
}
