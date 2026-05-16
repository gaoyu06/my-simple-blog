import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { getTagBySlug } from "@/server/queries/taxonomy";
import { listArticlesByTag } from "@/server/queries/articles";
import { getT } from "@/lib/i18n";
import { localizedName } from "@/lib/taxonomy-i18n";

export default async function TagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);
  if (!tag) notFound();
  const [articles, { t, locale }] = await Promise.all([listArticlesByTag(slug), getT()]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-10">
        <Link
          href="/tags"
          className="font-mono text-xs uppercase tracking-wider text-[var(--color-foreground-subtle)] no-underline transition-colors hover:text-[var(--color-foreground)]"
        >
          {t("tag.backLink")}
        </Link>
        <p className="eyebrow mb-2 mt-4">{t("tag.eyebrow")}</p>
        <h1 className="font-serif text-4xl font-medium tracking-tight">#{localizedName(tag, locale)}</h1>
      </div>
      <ul className="flex flex-col divide-y divide-[var(--color-border)]">
        {articles.map((article) => (
          <li key={article.id} className="group py-6">
            <div className="flex items-baseline justify-between gap-6">
              <div className="min-w-0 flex-1">
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
      {articles.length === 0 ? (
        <p className="text-sm text-[var(--color-foreground-muted)]">{t("tag.empty")}</p>
      ) : null}
    </div>
  );
}
