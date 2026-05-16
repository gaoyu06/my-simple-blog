import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listCategoriesWithCounts } from "@/server/queries/taxonomy";
import { getT } from "@/lib/i18n";
import { localizedName, localizedDescription } from "@/lib/taxonomy-i18n";

export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const [categories, { t, locale }] = await Promise.all([listCategoriesWithCounts(), getT()]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-10">
        <p className="eyebrow mb-2">{t("categories.eyebrow")}</p>
        <h1 className="font-serif text-4xl font-medium tracking-tight">{t("categories.title")}</h1>
      </div>
      {categories.length === 0 ? (
        <p className="text-sm text-[var(--color-foreground-muted)]">{t("categories.empty")}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {categories.map((c, idx) => {
            const name = localizedName(c, locale);
            const desc = localizedDescription(c, locale);
            return (
            <Link key={c.id} href={`/categories/${c.slug}`} className="no-underline">
              <Card className={`rise rise-${Math.min(idx + 1, 6)} h-full`}>
                <CardHeader>
                  <CardTitle className="text-lg">{name}</CardTitle>
                  {desc ? (
                    <CardDescription className="line-clamp-2">{desc}</CardDescription>
                  ) : null}
                </CardHeader>
                <CardContent>
                  <p className="font-mono text-xs uppercase tracking-wider text-[var(--color-foreground-subtle)]">
                    {c.articleCount === 1
                      ? t("categories.countOne")
                      : t("categories.count", { count: c.articleCount })}
                  </p>
                </CardContent>
              </Card>
            </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
