"use client";

import { useEffect, useRef } from "react";

type Dot = { hx: number; hy: number; x: number; y: number; vx: number; vy: number };

/**
 * The name drawn as a dot matrix. Dots rise into place on load; the pointer
 * pushes them aside and they spring back. Displaced dots take the accent color.
 */
export function DotName({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let dots: Dot[] = [];
    let w = 0;
    let h = 0;
    let mx = -1e4;
    let my = -1e4;
    let raf = 0;
    let alive = true;

    const build = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = cv.clientWidth;
      h = cv.clientHeight;
      cv.width = w * dpr;
      cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const off = document.createElement("canvas");
      off.width = w;
      off.height = h;
      const o = off.getContext("2d", { willReadFrequently: true });
      if (!o) return;
      o.font = `800 ${h * 1.12}px ${getComputedStyle(cv).fontFamily}`;
      o.letterSpacing = `${-h * 0.06}px`;
      o.fillText(text, -h * 0.04, h * 0.86);
      const img = o.getImageData(0, 0, w, h).data;
      const gap = w < 600 ? 5 : 7;
      dots = [];
      for (let y = 0; y < h; y += gap)
        for (let x = 0; x < w; x += gap)
          if (img[(y * w + x) * 4 + 3] > 128)
            dots.push({
              hx: x,
              hy: y,
              x: reduce ? x : Math.random() * w,
              y: reduce ? y : h + Math.random() * h * 0.6,
              vx: 0,
              vy: 0,
            });
    };

    const frame = () => {
      const style = getComputedStyle(cv);
      const fg = style.getPropertyValue("--color-foreground");
      const accent = style.getPropertyValue("--color-primary");
      const radius = w < 600 ? 60 : 110;
      const size = w < 600 ? 1.5 : 2;
      ctx.clearRect(0, 0, w, h);
      let moving = false;
      for (const p of dots) {
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.hypot(dx, dy);
        if (dist < radius) {
          const f = (1 - dist / radius) * 2.4;
          p.vx += (dx / (dist || 1)) * f;
          p.vy += (dy / (dist || 1)) * f;
        }
        p.vx = (p.vx + (p.hx - p.x) * 0.045) * 0.82;
        p.vy = (p.vy + (p.hy - p.y) * 0.045) * 0.82;
        p.x += p.vx;
        p.y += p.vy;
        const off = Math.hypot(p.x - p.hx, p.y - p.hy);
        if (off > 0.3) moving = true;
        ctx.fillStyle = off > 4 ? accent : fg;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, 7);
        ctx.fill();
      }
      // Idle when every dot is home and the pointer is away; pointer events restart it.
      raf = moving || mx > -1e3 ? requestAnimationFrame(frame) : 0;
    };
    const kick = () => {
      if (!raf && alive) raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      const b = cv.getBoundingClientRect();
      mx = e.clientX - b.left;
      my = e.clientY - b.top;
      kick();
    };
    const onLeave = () => {
      mx = my = -1e4;
    };
    const onResize = () => {
      build();
      kick();
    };
    // Repaint once when the theme flips so idle dots pick up the new color.
    const themeObserver = new MutationObserver(kick);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    document.fonts.load(`800 100px ${getComputedStyle(cv).fontFamily}`).finally(() => {
      if (!alive) return;
      build();
      kick();
    });
    cv.addEventListener("pointermove", onMove);
    cv.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onResize);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      themeObserver.disconnect();
      cv.removeEventListener("pointermove", onMove);
      cv.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, [text]);

  return <canvas ref={ref} role="img" aria-label={text} className={className} />;
}
