import Link from "next/link";

import { PageHeading } from "@/components/site/page-heading";
import { listTagsWithCounts } from "@/server/queries/taxonomy";
import { localizedName } from "@/lib/taxonomy-i18n";

export const metadata = { title: "标签" };

export default async function TagsPage() {
  const tags = await listTagsWithCounts();
  return (
    <div className="mx-auto max-w-3xl px-4 pt-10 sm:px-6 sm:pt-14">
      <PageHeading title="标签" note={`${tags.length} 个`} />
      <ul className="flex flex-wrap gap-2.5">
        {tags.map((t) => (
          <li key={t.id}>
            <Link
              href={`/tags/${t.slug}`}
              className="inline-flex items-baseline gap-2 rounded-[var(--radius-md)] px-3 py-1.5 text-[14.5px] shadow-[inset_0_0_0_1px_var(--color-border)] transition-colors hover:text-[var(--color-primary)] hover:shadow-[inset_0_0_0_1px_var(--color-border-strong)]"
            >
              {localizedName(t, "zh")}
              <span className="font-mono text-xs text-[var(--color-foreground-subtle)]">{t.articleCount}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
