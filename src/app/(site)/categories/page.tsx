import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PageHeading } from "@/components/site/page-heading";
import { listCategoriesWithCounts } from "@/server/queries/taxonomy";
import { localizedDescription, localizedName } from "@/lib/taxonomy-i18n";

export const metadata = { title: "分类" };

export default async function CategoriesPage() {
  const categories = (await listCategoriesWithCounts()).filter((c) => c.articleCount > 0);
  return (
    <div className="mx-auto max-w-5xl px-4 pt-10 sm:px-6 sm:pt-14">
      <PageHeading title="分类" note={`${categories.length} 个`} />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => {
          const description = localizedDescription(c, "zh");
          return (
            <li key={c.id}>
              <Link
                href={`/categories/${c.slug}`}
                className="group flex h-full min-h-[148px] flex-col justify-between rounded-[var(--radius-2xl)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)]"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-[22px] font-semibold tracking-[-0.02em] transition-colors group-hover:text-[var(--color-primary)]">
                      {localizedName(c, "zh")}
                    </span>
                    <ArrowRight
                      className="mt-1.5 h-4 w-4 -translate-x-1 text-[var(--color-primary)] opacity-0 transition-[opacity,translate] duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                      aria-hidden
                    />
                  </div>
                  {description ? (
                    <p className="mt-2 text-sm leading-relaxed text-[var(--color-foreground-muted)]">{description}</p>
                  ) : null}
                </div>
                <p className="mt-6 font-mono text-[13px] tabular-nums text-[var(--color-foreground-subtle)]">
                  {c.articleCount} 篇
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
