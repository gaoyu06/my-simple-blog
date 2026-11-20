"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";

import type { Work } from "@/server/queries/works";
import styles from "./home.module.css";

/** A featured work: faint dot grid whose dots swell and redden around the pointer. */
export function WorkTile({ work, large }: { work: Work; large?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    const tile = cv?.parentElement;
    const ctx = cv?.getContext("2d");
    if (!cv || !tile || !ctx) return;
    let w = 0;
    let h = 0;
    let mx = -1e4;
    let my = -1e4;
    let raf = 0;

    const draw = () => {
      raf = 0;
      const style = getComputedStyle(cv);
      const dot = style.getPropertyValue("--color-border-strong");
      const accent = style.getPropertyValue("--color-primary");
      const gap = 18;
      const radius = 130;
      ctx.clearRect(0, 0, w, h);
      for (let y = gap / 2; y < h; y += gap)
        for (let x = gap / 2; x < w; x += gap) {
          const k = Math.max(0, 1 - Math.hypot(x - mx, y - my) / radius);
          ctx.fillStyle = k > 0.05 ? accent : dot;
          ctx.globalAlpha = k > 0.05 ? 0.25 + k * 0.75 : 1;
          ctx.beginPath();
          ctx.arc(x, y, 1.1 + k * 2.6, 0, 7);
          ctx.fill();
        }
      ctx.globalAlpha = 1;
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };
    const size = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = cv.clientWidth;
      h = cv.clientHeight;
      cv.width = w * dpr;
      cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      schedule();
    };
    const onMove = (e: PointerEvent) => {
      const b = cv.getBoundingClientRect();
      mx = e.clientX - b.left;
      my = e.clientY - b.top;
      schedule();
    };
    const onLeave = () => {
      mx = my = -1e4;
      schedule();
    };

    const ro = new ResizeObserver(size);
    ro.observe(cv);
    const themeObserver = new MutationObserver(schedule);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    tile.addEventListener("pointermove", onMove);
    tile.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      themeObserver.disconnect();
      tile.removeEventListener("pointermove", onMove);
      tile.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <Link href={work.href} className={`${styles.tile} ${large ? styles.tileLarge : ""} ${styles.reveal}`}>
      <canvas ref={ref} aria-hidden />
      <span className={styles.tileGo} aria-hidden>
        <ArrowRight className="h-4 w-4" />
      </span>
      <div className={styles.tileBody}>
        <div className={styles.tileMeta}>
          {work.kind} · {work.range}
        </div>
        <h3>{work.name}</h3>
        <p>{work.summary}</p>
        <div className={styles.tileStack}>{work.stack}</div>
      </div>
    </Link>
  );
}
