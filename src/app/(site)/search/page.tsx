import Link from "next/link";
import { formatDate } from "@/lib/date";
import { Search } from "lucide-react";

import { searchArticles } from "@/server/queries/search";

export const metadata = { title: "搜索" };

function Highlight({ text, query }: { text: string; query: string }) {
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  const parts: React.ReactNode[] = [];
  let from = 0;
  for (let at = lower.indexOf(q); q && at >= 0; at = lower.indexOf(q, at + q.length)) {
    parts.push(text.slice(from, at), <mark key={at}>{text.slice(at, at + q.length)}</mark>);
    from = at + q.length;
  }
  parts.push(text.slice(from));
  return <>{parts}</>;
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const query = ((await searchParams).q ?? "").trim();
  const results = query ? await searchArticles(query) : [];

  return (
    <div className="mx-auto max-w-3xl px-4 pt-10 sm:px-6 sm:pt-14">
      <form action="/search" method="get" role="search" className="relative">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-foreground-subtle)]"
          aria-hidden
        />
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="搜索文章标题和正文"
          aria-label="搜索文章"
          autoFocus
          className="h-12 w-full rounded-[var(--radius-md)] bg-[var(--color-elevated)] pl-10 pr-4 text-[16px] shadow-[var(--shadow-input)] outline-none transition-shadow focus:shadow-[var(--shadow-input-focus)] focus-visible:outline-none"
        />
      </form>

      {query ? (
        <p className="mt-6 text-sm text-[var(--color-foreground-subtle)]">
          {results.length ? `找到 ${results.length} 篇` : `没有找到包含“${query}”的文章`}
        </p>
      ) : null}

      <ul className="mt-2 divide-y divide-[var(--color-border)]">
        {results.map((a) => (
          <li key={a.id}>
            <Link href={`/articles/${a.slug}`} className="group block py-5">
              <h2 className="text-[17px] font-semibold leading-snug transition-colors group-hover:text-[var(--color-primary)]">
                <Highlight text={a.title} query={query} />
              </h2>
              {a.snippet ? (
                <p className="mt-1.5 line-clamp-2 text-[14.5px] leading-relaxed text-[var(--color-foreground-muted)]">
                  <Highlight text={a.snippet} query={query} />
                </p>
              ) : null}
              <time className="mt-2 block font-mono text-[13px] text-[var(--color-foreground-subtle)]">
                {a.publishedAt ? formatDate(a.publishedAt) : ""}
              </time>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
