import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/date";
import type { Metadata } from "next";

import { renderArticle, stripLeadingTitle, type Heading } from "@/lib/markdown";
import { getAdjacentArticles, getArticleBySlug } from "@/server/queries/articles";
import { CommentSection } from "@/components/comments/comment-section";
import { ViewBeacon } from "@/components/site/view-beacon";
import { localizedName } from "@/lib/taxonomy-i18n";
import { decodeParam } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

// Rendered on first visit, then cached until content changes.
export function generateStaticParams() {
  return [];
}

async function loadArticle(params: Props["params"]) {
  const article = await getArticleBySlug(decodeParam((await params).slug));
  return article?.status === "PUBLISHED" ? article : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await loadArticle(params);
  if (!article) return {};
  return {
    title: article.title,
    description: article.summary ?? undefined,
    alternates: { canonical: `/articles/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.summary ?? undefined,
      publishedTime: article.publishedAt?.toISOString(),
      tags: article.tags.map((t) => t.tag.name),
    },
  };
}

function Toc({ headings }: { headings: Heading[] }) {
  return (
    <ol className="flex flex-col gap-2 text-[13.5px] leading-snug">
      {headings.map((h) => (
        <li key={h.id} className={h.depth === 3 ? "pl-3" : ""}>
          <a
            href={`#${h.id}`}
            className="text-[var(--color-foreground-muted)] transition-colors hover:text-[var(--color-foreground)]"
          >
            {h.text}
          </a>
        </li>
      ))}
    </ol>
  );
}

export default async function ArticlePage({ params }: Props) {
  const article = await loadArticle(params);
  if (!article) notFound();

  const [{ html, headings }, adjacent] = await Promise.all([
    renderArticle(stripLeadingTitle(article.contentMd, article.title)),
    article.publishedAt ? getAdjacentArticles(article.publishedAt) : { prev: null, next: null },
  ]);
  const showToc = headings.length >= 3;

  return (
    <div className="mx-auto max-w-[720px] px-4 pt-10 sm:px-6 sm:pt-14 xl:grid xl:max-w-[1240px] xl:grid-cols-[minmax(0,1fr)_720px_minmax(0,1fr)] xl:gap-14">
      <div className="hidden xl:block" />
      <article className="min-w-0">
        <header className="mb-8">
          <h1 className="text-[26px] font-semibold leading-[1.35] sm:text-[32px]">{article.title}</h1>
          <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13.5px] text-[var(--color-foreground-subtle)]">
            {article.publishedAt ? (
              <time className="font-mono" dateTime={article.publishedAt.toISOString()}>
                {formatDate(article.publishedAt)}
              </time>
            ) : null}
            {article.category ? (
              <Link href={`/categories/${article.category.slug}`} className="hover:text-[var(--color-foreground)]">
                {localizedName(article.category, "zh")}
              </Link>
            ) : null}
            <span>{article.readingTime} 分钟阅读</span>
            <span>{article.viewCount} 次浏览</span>
          </p>
        </header>

        {article.coverImage ? (
          <Image
            src={article.coverImage}
            alt=""
            width={1440}
            height={810}
            priority
            sizes="(max-width: 760px) 100vw, 720px"
            className="mb-10 h-auto w-full rounded-[var(--radius-md)] bg-[var(--color-muted)]"
          />
        ) : null}

        {showToc ? (
          <details className="mb-8 rounded-[var(--radius-md)] px-4 py-3 shadow-[var(--shadow-hairline)] xl:hidden">
            <summary className="cursor-pointer text-sm font-medium">目录</summary>
            <div className="mt-3">
              <Toc headings={headings} />
            </div>
          </details>
        ) : null}

        <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />

        {article.tags.length ? (
          <ul className="mt-12 flex flex-wrap gap-2">
            {article.tags.map(({ tag }) => (
              <li key={tag.id}>
                <Link
                  href={`/tags/${tag.slug}`}
                  className="inline-block rounded-[var(--radius-sm)] bg-[var(--color-muted)] px-2.5 py-1 text-[13px] text-[var(--color-foreground-muted)] transition-colors hover:text-[var(--color-foreground)]"
                >
                  # {localizedName(tag, "zh")}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}

        {adjacent.prev || adjacent.next ? (
          <nav aria-label="相邻文章" className="mt-12 grid gap-4 border-t border-[var(--color-border)] pt-6 sm:grid-cols-2">
            {adjacent.next ? (
              <Link href={`/articles/${adjacent.next.slug}`} className="group">
                <span className="text-xs text-[var(--color-foreground-subtle)]">← 较新</span>
                <span className="mt-1 block text-[15px] transition-colors group-hover:text-[var(--color-primary)]">
                  {adjacent.next.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {adjacent.prev ? (
              <Link href={`/articles/${adjacent.prev.slug}`} className="group sm:text-right">
                <span className="text-xs text-[var(--color-foreground-subtle)]">较早 →</span>
                <span className="mt-1 block text-[15px] transition-colors group-hover:text-[var(--color-primary)]">
                  {adjacent.prev.title}
                </span>
              </Link>
            ) : null}
          </nav>
        ) : null}

        <div className="mt-14 border-t border-[var(--color-border)] pt-10">
          <CommentSection articleId={article.id} allowComment={article.allowComment} />
        </div>
      </article>

      {showToc ? (
        <aside className="hidden xl:block">
          <div className="sticky top-24 max-h-[calc(100dvh-8rem)] overflow-y-auto">
            <p className="mb-3 text-xs font-medium text-[var(--color-foreground-subtle)]">目录</p>
            <Toc headings={headings} />
          </div>
        </aside>
      ) : null}
      <ViewBeacon id={article.id} />
    </div>
  );
}
