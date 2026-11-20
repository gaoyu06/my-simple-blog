"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { Work } from "@/server/queries/works";
import styles from "./home.module.css";

/** Compact list of the remaining works; hovering one shows its summary in a card that trails the pointer. */
export function WorkRows({ works }: { works: Work[] }) {
  const [active, setActive] = useState<Work | null>(null);
  // Keeps the last hovered work in the card while it fades out.
  const [shown, setShown] = useState<Work | null>(null);
  const peek = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let px = 0;
    let py = 0;
    let tx = 0;
    let ty = 0;
    let raf = 0;
    const follow = () => {
      raf = 0;
      px += (tx - px) * 0.18;
      py += (ty - py) * 0.18;
      const el = peek.current;
      if (el) {
        const x = Math.min(px, innerWidth - el.offsetWidth - 16);
        const y = Math.min(py, innerHeight - el.offsetHeight - 16);
        el.style.transform = `translate(${x}px, ${y}px)`;
      }
      if (Math.abs(tx - px) + Math.abs(ty - py) > 0.5) raf = requestAnimationFrame(follow);
    };
    const onMove = (e: PointerEvent) => {
      tx = e.clientX + 22;
      ty = e.clientY + 20;
      if (!raf) raf = requestAnimationFrame(follow);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <>
      <ul className={`${styles.rows} ${active ? styles.rowsDim : ""}`} onPointerLeave={() => setActive(null)}>
        {works.map((w) => (
          <li key={w.href}>
            <Link
              href={w.href}
              className={active === w ? styles.rowOn : undefined}
              onPointerEnter={(e) => {
                if (e.pointerType !== "mouse") return;
                setActive(w);
                setShown(w);
              }}
            >
              <span className={styles.rowName}>{w.name}</span>
              <span className={styles.rowRange}>{w.range}</span>
              <span className={styles.rowKind}>{w.kind}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div ref={peek} className={`${styles.peek} ${active ? styles.peekOn : ""}`} aria-hidden>
        {shown ? (
          <>
            <p>{shown.summary}</p>
            <div className={styles.peekStack}>{shown.stack}</div>
          </>
        ) : null}
      </div>
    </>
  );
}
