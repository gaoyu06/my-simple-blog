import Link from "next/link";
import { formatMonthDay, yearOf } from "@/lib/date";

import { PageHeading } from "@/components/site/page-heading";
import { listArchive } from "@/server/queries/articles";

export const metadata = { title: "文章" };

export default async function ArchivePage() {
  const articles = await listArchive();
  const years = new Map<number, typeof articles>();
  for (const a of articles) {
    const year = yearOf(a.publishedAt ?? 0);
    years.set(year, [...(years.get(year) ?? []), a]);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pt-10 sm:px-6 sm:pt-14">
      <PageHeading title="全部文章" note={`${articles.length} 篇`} />
      {[...years].map(([year, items]) => (
        <section key={year} className="mt-10 first:mt-6" aria-labelledby={`y${year}`}>
          <h2 id={`y${year}`} className="mb-2 font-mono text-sm font-medium text-[var(--color-foreground-subtle)]">
            {year}
            <span className="ml-2 font-normal">· {items.length}</span>
          </h2>
          <ul>
            {items.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/articles/${a.slug}`}
                  className="group grid grid-cols-[3.5rem_minmax(0,1fr)] items-baseline gap-4 py-2.5"
                >
                  <time className="font-mono text-[13px] tabular-nums text-[var(--color-foreground-subtle)]">
                    {a.publishedAt ? formatMonthDay(a.publishedAt) : ""}
                  </time>
                  <span className="text-[15.5px] transition-colors group-hover:text-[var(--color-primary)]">
                    {a.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
