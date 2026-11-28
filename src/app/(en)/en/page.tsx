import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";

import { DotName } from "@/components/home/dot-name";
import { WorkRows } from "@/components/home/work-rows";
import { WorkTile } from "@/components/home/work-tile";
import styles from "@/components/home/home.module.css";
import { formatDate } from "@/lib/date";
import { CONTACT_EMAIL, GITHUB_URL } from "@/lib/links";
import { listPublishedArticles } from "@/server/queries/articles";
import { getSiteMeta } from "@/server/queries/site";
import { listWorks } from "@/server/queries/works";

export const metadata: Metadata = { alternates: { languages: { "zh-CN": "/", en: "/en" } } };

/** Works shown as large tiles, in this order; the rest go to the compact list. */
const FEATURED = ["/en/aicare", "/en/jucode", "/en/printapp"];

export default async function EnglishHomePage() {
  const [meta, works, posts] = await Promise.all([getSiteMeta(), listWorks("en/works"), listPublishedArticles({ take: 5 })]);
  const featured = FEATURED.map((href) => works.find((w) => w.href === href)).filter((w) => w !== undefined);
  const others = works.filter((w) => !featured.includes(w));

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6">
      <section className={styles.hero}>
        <DotName text={meta.name} className={styles.name} />
        <div className={styles.id}>
          <h1>Yu Gao</h1>
          <p className={styles.lede}>
            Independent developer in Hefei, China. I build AI agents, LLM integrations and full-stack apps that run in
            production.
          </p>
          <dl className={styles.now}>
            <dt>Open to</dt>
            <dd>Freelance work: AI agents, LLM features, automation and full-stack apps. UTC+8.</dd>
          </dl>
          <div className={styles.links}>
            <a className={`${styles.btn} ${styles.btnPrimary}`} href={`mailto:${CONTACT_EMAIL}`}>
              Email
            </a>
            <a className={styles.btn} href={GITHUB_URL} target="_blank" rel="noreferrer">
              GitHub
            </a>
          </div>
        </div>
      </section>

      {works.length ? (
        <section>
          <div className={styles.secHead}>
            <h2>Works</h2>
            <Link href="/en/works">
              All works <ArrowRight className="h-3.5 w-3.5" aria-hidden />
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
              <div className={styles.moreHead}>More works</div>
              <WorkRows works={others} />
            </>
          ) : null}
        </section>
      ) : null}

      {posts.length ? (
        <section>
          <div className={styles.secHead}>
            <h2>Writing</h2>
            <Link href="/archive">
              All posts <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
          <p className="mb-4 text-[14px] text-[var(--color-foreground-muted)]">My blog is written in Chinese.</p>
          <ul className={styles.posts}>
            {posts.map((a) => (
              <li key={a.id}>
                <Link href={`/articles/${a.slug}`} hrefLang="zh-CN">
                  <time className={styles.postDate} dateTime={a.publishedAt?.toISOString()}>
                    {a.publishedAt ? formatDate(a.publishedAt) : ""}
                  </time>
                  <span className={styles.postTitle} lang="zh-CN">
                    {a.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
