import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { after } from "next/server";
import type { Metadata } from "next";
import { Eye, Clock } from "lucide-react";

import { db } from "@/lib/db";
import { renderMarkdown, stripLeadingTitle } from "@/lib/markdown";
import { getArticleBySlug } from "@/server/queries/articles";
import { Badge } from "@/components/ui/badge";
import { TagChip } from "@/components/ui/tag-chip";
import { Separator } from "@/components/ui/separator";
import { CommentSection } from "@/components/comments/comment-section";
import { getT } from "@/lib/i18n";
import { localizedName } from "@/lib/taxonomy-i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.summary ?? undefined,
    openGraph: {
      title: article.title,
      description: article.summary ?? undefined,
      images: article.coverImage ? [{ url: article.coverImage }] : undefined,
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
      authors: article.author?.name ? [article.author.name] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article || article.status !== "PUBLISHED") notFound();

  after(async () => {
    try {
      await db.article.update({
        where: { id: article.id },
        data: { viewCount: { increment: 1 } },
      });
    } catch (e) {
      console.error("view count increment failed", e);
    }
  });

  const cleanedMd = stripLeadingTitle(article.contentMd, article.title);
  const [html, { t, locale }] = await Promise.all([renderMarkdown(cleanedMd), getT()]);
  const authorName = article.author?.name ?? article.author?.username ?? t("article.anonymous");

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <header className="mb-10">
        <Link
          href="/archive"
          className="font-mono text-xs uppercase tracking-wider text-[var(--color-foreground-subtle)] no-underline transition-colors hover:text-[var(--color-foreground)]"
        >
          {t("article.backLink")}
        </Link>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {article.category ? (
            <Link href={`/categories/${article.category.slug}`} className="no-underline">
              <Badge variant="outline">{localizedName(article.category, locale)}</Badge>
            </Link>
          ) : null}
          {article.featured ? <Badge variant="default">{t("home.article.featured")}</Badge> : null}
        </div>
        <h1 className="mt-4 font-serif text-4xl font-medium leading-[1.1] tracking-tight sm:text-5xl">
          {article.title}
        </h1>
        {article.summary ? (
          <p className="mt-4 text-lg leading-relaxed text-[var(--color-foreground-muted)]">
            {article.summary}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--color-foreground-subtle)]">
          {article.author ? (
            <span className="text-[var(--color-foreground-muted)]">
              {t("article.by", { author: authorName })}
            </span>
          ) : null}
          {article.publishedAt ? (
            <time className="font-mono uppercase tabular-nums tracking-wider">
              {format(article.publishedAt, "yyyy.MM.dd")}
            </time>
          ) : null}
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3 w-3" aria-hidden />
            <span className="tabular-nums">{t("article.minRead", { count: article.readingTime })}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Eye className="h-3 w-3" aria-hidden />
            <span className="tabular-nums">{article.viewCount}</span>
          </span>
        </div>
      </header>

      {article.coverImage ? (
        <div className="mb-10 overflow-hidden rounded-[var(--radius-lg)] shadow-[var(--shadow-card)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.coverImage}
            alt={article.title}
            className="h-auto w-full object-cover"
          />
        </div>
      ) : null}

      <div
        className="prose"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {article.tags.length > 0 ? (
        <div className="mt-12">
          <p className="eyebrow mb-3">{t("article.tags")}</p>
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <TagChip
                key={tag.tag.id}
                name={localizedName(tag.tag, locale)}
                href={`/tags/${tag.tag.slug}`}
              />
            ))}
          </div>
        </div>
      ) : null}

      <Separator className="my-12" />
      <CommentSection articleId={article.id} allowComment={article.allowComment} />
    </article>
  );
}
