import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/date";

import type { ArticleListItem } from "@/server/queries/articles";

/**
 * The reading list: date in a fixed mono column, title, two lines of summary.
 * A thumbnail appears only when the author set a cover.
 */
export function ArticleList({ articles }: { articles: ArticleListItem[] }) {
  return (
    <ol className="flex flex-col">
      {articles.map((a) => (
        <li key={a.id} className="border-b border-[var(--color-border)] last:border-b-0">
          <Link
            href={`/articles/${a.slug}`}
            className="group grid gap-x-8 gap-y-1.5 py-6 sm:grid-cols-[6.5rem_minmax(0,1fr)]"
          >
            <time
              dateTime={a.publishedAt?.toISOString()}
              className="pt-[3px] font-mono text-[13px] tabular-nums text-[var(--color-foreground-subtle)]"
            >
              {a.publishedAt ? formatDate(a.publishedAt) : ""}
            </time>
            <div className="flex gap-5">
              <div className="min-w-0 flex-1">
                <h2 className="text-[17px] font-semibold leading-snug transition-colors group-hover:text-[var(--color-primary)] sm:text-lg">
                  {a.title}
                </h2>
                {a.summary ? (
                  <p className="mt-1.5 line-clamp-2 text-[14.5px] leading-relaxed text-[var(--color-foreground-muted)]">
                    {a.summary}
                  </p>
                ) : null}
                <p className="mt-2 text-[13px] text-[var(--color-foreground-subtle)]">
                  {[a.category?.name, `${a.readingTime} 分钟`].filter(Boolean).join(" · ")}
                </p>
              </div>
              {a.coverImage ? (
                <Image
                  src={a.coverImage}
                  alt=""
                  width={176}
                  height={99}
                  sizes="176px"
                  className="mt-1 hidden aspect-[16/9] h-auto w-[132px] shrink-0 rounded-[var(--radius-sm)] bg-[var(--color-muted)] object-cover sm:block md:w-[176px]"
                />
              ) : null}
            </div>
          </Link>
        </li>
      ))}
    </ol>
  );
}
