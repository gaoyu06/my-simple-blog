import Image from "next/image";
import Link from "next/link";

import type { Work } from "@/server/queries/works";
import styles from "./home.module.css";

/** The works page as a card grid: cover from each work's own page, then meta, name and summary. */
export function WorksGallery({ works }: { works: Work[] }) {
  return (
    <ul className={styles.gallery}>
      {works.map((w) => (
        <li key={w.href}>
          <Link href={w.href} className={styles.card}>
            <div className={styles.cover}>
              {w.cover ? <Image src={w.cover} alt="" fill sizes="(max-width: 820px) 100vw, 480px" /> : null}
            </div>
            <div className={styles.cardMeta}>
              <span>{w.kind}</span>
              <span>{w.range}</span>
            </div>
            <h2>{w.name}</h2>
            <p>{w.summary}</p>
            <div className={styles.cardStack}>{w.stack}</div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
