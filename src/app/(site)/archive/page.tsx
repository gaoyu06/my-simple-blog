import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listPublishedArticles, countPublishedArticles } from "@/server/queries/articles";
import { getT } from "@/lib/i18n";
import { localizedName } from "@/lib/taxonomy-i18n";

export const metadata = { title: "Archive" };

const PAGE_SIZE = 20;

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));
  const [articles, total, { t, locale }] = await Promise.all([
    listPublishedArticles({ take: PAGE_SIZE, skip: (page - 1) * PAGE_SIZE }),
    countPublishedArticles(),
    getT(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-10">
        <p className="eyebrow mb-2">{t("archive.eyebrow")}</p>
        <h1 className="font-serif text-4xl font-medium tracking-tight">{t("archive.title")}</h1>
        <p className="mt-2 text-sm text-[var(--color-foreground-muted)]">
          {total === 1 ? t("archive.totalOne") : t("archive.total", { count: total })}
        </p>
      </div>

      {articles.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-[var(--color-foreground-muted)]">
            {t("archive.empty")}
          </CardContent>
        </Card>
      ) : (
        <ul className="flex flex-col divide-y divide-[var(--color-border)]">
          {articles.map((article) => (
            <li key={article.id} className="group py-6">
              <div className="flex items-baseline justify-between gap-6">
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex items-center gap-2">
                    {article.category ? (
                      <Badge variant="outline">{localizedName(article.category, locale)}</Badge>
                    ) : null}
                    {article.featured ? <Badge variant="default">{t("home.article.featured")}</Badge> : null}
                  </div>
                  <Link href={`/articles/${article.slug}`} className="no-underline">
                    <h2 className="font-serif text-xl font-medium leading-snug tracking-tight transition-colors group-hover:text-[var(--color-primary)]">
                      {article.title}
                    </h2>
                  </Link>
                  {article.summary ? (
                    <p className="mt-1 line-clamp-2 text-sm text-[var(--color-foreground-muted)]">
                      {article.summary}
                    </p>
                  ) : null}
                </div>
                <time className="shrink-0 font-mono text-xs uppercase tabular-nums tracking-wider text-[var(--color-foreground-subtle)]">
                  {article.publishedAt ? format(article.publishedAt, "yyyy.MM.dd") : ""}
                </time>
              </div>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 ? (
        <nav className="mt-10 flex items-center justify-between text-sm">
          {page > 1 ? (
            <Link
              href={`/archive?page=${page - 1}`}
              className="text-[var(--color-foreground-muted)] no-underline transition-colors hover:text-[var(--color-foreground)]"
            >
              {t("archive.newer")}
            </Link>
          ) : (
            <span />
          )}
          <span className="font-mono text-xs uppercase tracking-wider text-[var(--color-foreground-subtle)]">
            {t("archive.pageOf", { page, total: totalPages })}
          </span>
          {page < totalPages ? (
            <Link
              href={`/archive?page=${page + 1}`}
              className="text-[var(--color-foreground-muted)] no-underline transition-colors hover:text-[var(--color-foreground)]"
            >
              {t("archive.older")}
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </div>
  );
}
