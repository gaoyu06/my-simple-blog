import Link from "next/link";
import { ArrowRight, Rss } from "lucide-react";

import { DotName } from "@/components/home/dot-name";
import { WorkRows } from "@/components/home/work-rows";
import { WorkTile } from "@/components/home/work-tile";
import styles from "@/components/home/home.module.css";
import { formatDate } from "@/lib/date";
import { GITHUB_URL } from "@/lib/links";
import { getSettings } from "@/lib/settings";
import { SETTINGS } from "@/lib/settings-keys";
import { countPublishedArticles, listPublishedArticles } from "@/server/queries/articles";
import { getSiteMeta } from "@/server/queries/site";
import { listWorks } from "@/server/queries/works";

/** Works shown as large tiles, in this order; the rest go to the compact list. */
const FEATURED = ["/aicare", "/jucode", "/fpsmaster"];
const POST_COUNT = 7;

export default async function HomePage() {
  const [meta, works, articles, total, home] = await Promise.all([
    getSiteMeta(),
    listWorks(),
    listPublishedArticles({ take: POST_COUNT }),
    countPublishedArticles(),
    getSettings([SETTINGS.HOME_HERO_TITLE, SETTINGS.HOME_HERO_LEDE]),
  ]);
  const fullName = (home[SETTINGS.HOME_HERO_TITLE] as string) || meta.name;
  const lede = (home[SETTINGS.HOME_HERO_LEDE] as string) || meta.description;

  const featured = FEATURED.map((href) => works.find((w) => w.href === href)).filter((w) => w !== undefined);
  const others = works.filter((w) => !featured.includes(w));
  const [lead, ...rest] = articles;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6">
      <section className={styles.hero}>
        <DotName text={meta.name} className={styles.name} />
        <div className={styles.id}>
          <h1>{fullName}</h1>
          {lede ? <p className={styles.lede}>{lede}</p> : null}
          <dl className={styles.now}>
            {lead ? (
              <>
                <dt>在写</dt>
                <dd>
                  {total} 篇文章，最近一篇是
                  <Link href={`/articles/${lead.slug}`}>《{lead.title}》</Link>
                </dd>
              </>
            ) : null}
          </dl>
          <div className={styles.links}>
            <a className={`${styles.btn} ${styles.btnPrimary}`} href={GITHUB_URL} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a className={styles.btn} href="/rss.xml">
              <Rss className="h-3.5 w-3.5" aria-hidden />
              RSS
            </a>
          </div>
        </div>
      </section>

      {works.length ? (
        <section>
          <div className={styles.secHead}>
            <h2>作品</h2>
            <Link href="/works">
              全部作品 <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
          {featured.length ? (
            <div className={styles.feat}>
              {featured.map((w, i) => (
                <WorkTile key={w.href} work={w} large={i === 0} />
              ))}
            </div>
          ) : null}
          {others.length ? (
            <>
              <div className={styles.moreHead}>其他作品</div>
              <WorkRows works={others} />
            </>
          ) : null}
        </section>
      ) : null}

      {lead ? (
        <section>
          <div className={styles.secHead}>
            <h2>文章</h2>
            <Link href="/archive">
              全部 {total} 篇 <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
          <div className={styles.writing}>
            <Link href={`/articles/${lead.slug}`} className={`${styles.lead} ${styles.reveal}`}>
              <span className={styles.leadDate}>{lead.publishedAt ? formatDate(lead.publishedAt) : ""} · 最新</span>
              <h3>{lead.title}</h3>
              {lead.summary ? <p className="line-clamp-4">{lead.summary}</p> : null}
              <span className={styles.leadMore}>
                阅读全文 <ArrowRight className="h-4 w-4" aria-hidden />
              </span>
            </Link>
            <ul className={styles.posts}>
              {rest.map((a) => (
                <li key={a.id}>
                  <Link href={`/articles/${a.slug}`}>
                    <time className={styles.postDate} dateTime={a.publishedAt?.toISOString()}>
                      {a.publishedAt ? formatDate(a.publishedAt) : ""}
                    </time>
                    <span className={styles.postTitle}>{a.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : (
        <p className="py-20 text-center text-[var(--color-foreground-muted)]">还没有发布文章。</p>
      )}
    </div>
  );
}
