import Link from "next/link";

import { PageHeading } from "@/components/site/page-heading";
import { listCategoriesWithCounts } from "@/server/queries/taxonomy";
import { localizedDescription, localizedName } from "@/lib/taxonomy-i18n";

export const metadata = { title: "分类" };

export default async function CategoriesPage() {
  const categories = (await listCategoriesWithCounts()).filter((c) => c.articleCount > 0);
  return (
    <div className="mx-auto max-w-3xl px-4 pt-10 sm:px-6 sm:pt-14">
      <PageHeading title="分类" note={`${categories.length} 个`} />
      <ul className="divide-y divide-[var(--color-border)]">
        {categories.map((c) => {
          const description = localizedDescription(c, "zh");
          return (
            <li key={c.id}>
              <Link href={`/categories/${c.slug}`} className="group flex items-baseline justify-between gap-6 py-4">
                <span>
                  <span className="text-[16px] font-medium transition-colors group-hover:text-[var(--color-primary)]">
                    {localizedName(c, "zh")}
                  </span>
                  {description ? (
                    <span className="mt-1 block text-sm text-[var(--color-foreground-muted)]">{description}</span>
                  ) : null}
                </span>
                <span className="shrink-0 font-mono text-[13px] tabular-nums text-[var(--color-foreground-subtle)]">
                  {c.articleCount} 篇
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
