import Link from "next/link";
import { format } from "date-fns";
import { Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { searchArticles } from "@/server/queries/search";
import { getT } from "@/lib/i18n";

export const metadata = { title: "Search" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const [results, { t }] = await Promise.all([
    query ? searchArticles(query) : Promise.resolve([]),
    getT(),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-10">
        <p className="eyebrow mb-2">{t("search.eyebrow")}</p>
        <h1 className="font-serif text-4xl font-medium tracking-tight">{t("search.title")}</h1>
        <form action="/search" method="get" className="mt-6">
          <div className="relative">
            <SearchIcon
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-foreground-subtle)]"
              aria-hidden
            />
            <Input
              type="search"
              name="q"
              defaultValue={query}
              placeholder={t("search.placeholder")}
              className="pl-9"
              autoFocus
            />
          </div>
        </form>
      </div>

      {!query ? (
        <p className="text-sm text-[var(--color-foreground-muted)]">{t("search.hint")}</p>
      ) : results.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-[var(--color-foreground-muted)]">
            {t("search.noResults", { q: query })}
          </CardContent>
        </Card>
      ) : (
        <ul className="flex flex-col divide-y divide-[var(--color-border)]">
          {results.map((article) => (
            <li key={article.id} className="group py-6">
              <Link href={`/articles/${article.slug}`} className="no-underline">
                <h2 className="font-serif text-xl font-medium leading-snug tracking-tight transition-colors group-hover:text-[var(--color-primary)]">
                  {article.title}
                </h2>
              </Link>
              {article.snippet ? (
                <p
                  className="mt-1 line-clamp-2 text-sm leading-relaxed text-[var(--color-foreground-muted)] [&_mark]:rounded [&_mark]:bg-[var(--color-primary-subtle)] [&_mark]:px-0.5 [&_mark]:text-[var(--color-primary)]"
                  dangerouslySetInnerHTML={{ __html: article.snippet }}
                />
              ) : null}
              <time className="mt-2 block font-mono text-xs uppercase tabular-nums tracking-wider text-[var(--color-foreground-subtle)]">
                {article.publishedAt ? format(article.publishedAt, "yyyy.MM.dd") : ""}
              </time>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
