import * as React from "react";
import Link from "next/link";
import { ArrowRight, Feather } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listPublishedArticles } from "@/server/queries/articles";
import { getSiteMeta } from "@/server/queries/site";
import { getSettings } from "@/lib/settings";
import { SETTINGS } from "@/lib/settings-keys";
import { getT } from "@/lib/i18n";
import { localizedName } from "@/lib/taxonomy-i18n";

/** Render plain text, but treat *word* as italic-primary emphasis. */
function renderTitle(input: string): React.ReactNode {
  const parts = input.split(/(\*[^*]+\*)/g).filter(Boolean);
  return parts.map((p, i) => {
    if (p.length > 2 && p.startsWith("*") && p.endsWith("*")) {
      return (
        <span key={i} className="italic-serif text-[var(--color-primary)]">
          {p.slice(1, -1)}
        </span>
      );
    }
    return <React.Fragment key={i}>{p}</React.Fragment>;
  });
}

export default async function HomePage() {
  const [meta, articles, { t, locale }, home] = await Promise.all([
    getSiteMeta(),
    listPublishedArticles({ take: 6 }),
    getT(),
    getSettings([
      SETTINGS.HOME_HERO_EYEBROW,
      SETTINGS.HOME_HERO_TITLE,
      SETTINGS.HOME_HERO_LEDE,
      SETTINGS.HOME_CTA_PRIMARY_LABEL,
      SETTINGS.HOME_CTA_PRIMARY_HREF,
      SETTINGS.HOME_CTA_SECONDARY_LABEL,
      SETTINGS.HOME_CTA_SECONDARY_HREF,
    ]),
  ]);

  const eyebrow =
    (home[SETTINGS.HOME_HERO_EYEBROW] as string) || t("home.eyebrow", { name: meta.name });
  const titleOverride = (home[SETTINGS.HOME_HERO_TITLE] as string) || "";
  const lede = (home[SETTINGS.HOME_HERO_LEDE] as string) || t("home.hero.lede");
  const ctaPrimaryLabel =
    (home[SETTINGS.HOME_CTA_PRIMARY_LABEL] as string) || t("home.cta.archive");
  const ctaPrimaryHref =
    (home[SETTINGS.HOME_CTA_PRIMARY_HREF] as string) || "/archive";
  const ctaSecondaryLabel =
    (home[SETTINGS.HOME_CTA_SECONDARY_LABEL] as string) || t("home.cta.categories");
  const ctaSecondaryHref =
    (home[SETTINGS.HOME_CTA_SECONDARY_HREF] as string) || "/categories";

  return (
    <>
      <section className="grain relative overflow-hidden bg-gradient-soft">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-28">
          <div className="rise rise-1">
            <p className="eyebrow mb-6">{eyebrow}</p>
            <h1 className="max-w-3xl font-serif text-5xl font-medium leading-[1.05] tracking-tight sm:text-6xl">
              {titleOverride ? (
                renderTitle(titleOverride)
              ) : meta.description ? (
                meta.description
              ) : (
                <>
                  {t("home.hero.titleA")}{" "}
                  <span className="italic-serif text-[var(--color-primary)]">
                    {t("home.hero.titleEm")}
                  </span>{" "}
                  {t("home.hero.titleB")}
                </>
              )}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-[var(--color-foreground-muted)]">
              {lede}
            </p>
            {ctaPrimaryLabel || ctaSecondaryLabel ? (
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {ctaPrimaryLabel ? (
                  <Button asChild size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                    <Link href={ctaPrimaryHref}>{ctaPrimaryLabel}</Link>
                  </Button>
                ) : null}
                {ctaSecondaryLabel ? (
                  <Button asChild variant="ghost" size="lg">
                    <Link href={ctaSecondaryHref}>{ctaSecondaryLabel}</Link>
                  </Button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--color-border)]">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="eyebrow mb-2">{t("home.recent.eyebrow")}</p>
              <h2 className="font-serif text-2xl font-medium tracking-tight">
                {t("home.recent.heading")}
              </h2>
            </div>
            <Link
              href="/archive"
              className="inline-flex items-center gap-1 text-sm text-[var(--color-foreground-muted)] no-underline transition-colors hover:text-[var(--color-foreground)]"
            >
              {t("home.recent.seeAll")}
              <ArrowRight className="h-3 w-3" aria-hidden />
            </Link>
          </div>

          {articles.length === 0 ? (
            <Card className="rise rise-2 mx-auto max-w-2xl">
              <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
                <div className="rounded-full bg-[var(--color-primary-subtle)] p-3 text-[var(--color-primary)] shadow-[inset_0_0_0_1px_oklch(from_var(--color-primary)_l_c_h/0.20)]">
                  <Feather className="h-5 w-5" aria-hidden />
                </div>
                <CardTitle className="mt-1 text-lg">{t("home.empty.title")}</CardTitle>
                <CardDescription className="max-w-md">{t("home.empty.body")}</CardDescription>
                <div className="mt-2 flex items-center gap-2">
                  <Button asChild size="sm">
                    <Link href="/admin">{t("home.empty.openDashboard")}</Link>
                  </Button>
                  <Button asChild size="sm" variant="ghost">
                    <Link href="/login">{t("common.signIn")}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {articles.map((article, idx) => (
                <Card key={article.id} className={`overflow-hidden rise rise-${Math.min(idx + 2, 6)}`}>
                  {article.coverImage ? (
                    <Link
                      href={`/articles/${article.slug}`}
                      className="block aspect-[16/9] overflow-hidden bg-[var(--color-muted)]"
                      aria-hidden="true"
                      tabIndex={-1}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={article.coverImage}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover/card:scale-[1.02]"
                      />
                    </Link>
                  ) : null}
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      {article.category ? (
                        <Badge variant="outline">{localizedName(article.category, locale)}</Badge>
                      ) : null}
                      {article.featured ? <Badge variant="default">{t("home.article.featured")}</Badge> : null}
                    </div>
                    <Link href={`/articles/${article.slug}`} className="no-underline">
                      <CardTitle className="hover:text-[var(--color-primary)] transition-colors">
                        {article.title}
                      </CardTitle>
                    </Link>
                    {article.summary ? (
                      <CardDescription className="line-clamp-3">{article.summary}</CardDescription>
                    ) : null}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-xs text-[var(--color-foreground-subtle)]">
                      <span>
                        {article.publishedAt ? format(article.publishedAt, "PP") : t("home.article.draft")}
                      </span>
                      <span className="tabular-nums">
                        {t("home.article.minRead", { count: article.readingTime })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
