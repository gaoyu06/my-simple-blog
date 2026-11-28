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
    <div className="mx-auto max-w-5xl px-4 pt-10 sm:px-6 sm:pt-14">
      <PageHeading title="全部文章" note={`${articles.length} 篇`} />
      {[...years].map(([year, items]) => (
        <section
          key={year}
          className="grid gap-x-12 border-b border-[var(--color-border)] py-8 last:border-b-0 md:grid-cols-[180px_minmax(0,1fr)]"
          aria-labelledby={`y${year}`}
        >
          {/* The year stays in view while its articles scroll past. */}
          <div className="mb-3 md:sticky md:top-24 md:mb-0 md:self-start">
            <h2 id={`y${year}`} className="text-[40px] font-semibold leading-none tracking-[-0.04em] md:text-[56px]">
              {year}
            </h2>
            <p className="mt-2 font-mono text-[13px] text-[var(--color-foreground-subtle)]">{items.length} 篇</p>
          </div>
          <ul>
            {items.map((a) => (
              <li key={a.id} className="border-t border-[var(--color-border)] first:border-t-0">
                <Link
                  href={`/articles/${a.slug}`}
                  className="group grid grid-cols-[3.5rem_minmax(0,1fr)] items-baseline gap-4 py-3.5"
                >
                  <time className="font-mono text-[13px] tabular-nums text-[var(--color-foreground-subtle)]">
                    {a.publishedAt ? formatMonthDay(a.publishedAt) : ""}
                  </time>
                  <span className="text-[16px] font-medium transition-[color,translate] duration-300 group-hover:translate-x-1.5 group-hover:text-[var(--color-primary)]">
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
