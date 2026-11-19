import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ArticleList } from "@/components/site/article-list";
import { countPublishedArticles, listPublishedArticles } from "@/server/queries/articles";
import { getSiteMeta } from "@/server/queries/site";
import { getSettings } from "@/lib/settings";
import { SETTINGS } from "@/lib/settings-keys";

const HOME_COUNT = 10;

export default async function HomePage() {
  const [meta, articles, total, home] = await Promise.all([
    getSiteMeta(),
    listPublishedArticles({ take: HOME_COUNT }),
    countPublishedArticles(),
    getSettings([SETTINGS.HOME_HERO_TITLE, SETTINGS.HOME_HERO_LEDE]),
  ]);
  const intro = (home[SETTINGS.HOME_HERO_TITLE] as string) || meta.description;
  const lede = home[SETTINGS.HOME_HERO_LEDE] as string;

  return (
    <div className="mx-auto max-w-3xl px-4 pt-10 sm:px-6 sm:pt-14">
      {intro || lede ? (
        <section className="mb-8 border-b border-[var(--color-border)] pb-8">
          {intro ? <h1 className="text-2xl font-semibold sm:text-[28px]">{intro}</h1> : null}
          {lede ? <p className="mt-3 max-w-xl text-[var(--color-foreground-muted)]">{lede}</p> : null}
        </section>
      ) : (
        <h1 className="sr-only">{meta.name}</h1>
      )}

      {articles.length ? (
        <ArticleList articles={articles} />
      ) : (
        <p className="py-20 text-center text-[var(--color-foreground-muted)]">还没有发布文章。</p>
      )}

      {total > HOME_COUNT ? (
        <Link
          href="/archive"
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)]"
        >
          全部 {total} 篇文章
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      ) : null}
    </div>
  );
}
