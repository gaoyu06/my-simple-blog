"use client";

import * as React from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Lightweight top progress bar.
 *
 * Strategy:
 * - Intercept clicks on internal `<a>` links to a different path; start the bar
 *   immediately so users get feedback even before the server responds.
 * - Hide once the pathname or searchParams actually change (route committed).
 * - Safety: a max-lifetime of 8s in case nothing changes.
 */
export function RouteProgress() {
  const pathname = usePathname();
  const search = useSearchParams();
  const [active, setActive] = React.useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const stop = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setActive(false);
  }, []);

  const start = React.useCallback(() => {
    setActive(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setActive(false), 8000);
  }, []);

  React.useEffect(() => {
    // Route has changed: hide.
    stop();
  }, [pathname, search, stop]);

  React.useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (event.button !== 0) return;
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const anchor = target.closest("a");
      if (!anchor || !(anchor instanceof HTMLAnchorElement)) return;
      const href = anchor.getAttribute("href");
      if (!href) return;
      if (anchor.target && anchor.target !== "" && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;
      if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      try {
        const url = new URL(anchor.href, window.location.href);
        if (url.origin !== window.location.origin) return;
        // Same URL — no navigation will happen.
        if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      } catch {
        return;
      }
      start();
    }

    function onSubmit(event: SubmitEvent) {
      const form = event.target as HTMLFormElement | null;
      if (!form) return;
      // Trigger for GET forms that submit to a known route (e.g. /search).
      if (form.method?.toLowerCase() === "get" && form.action) {
        try {
          const url = new URL(form.action, window.location.href);
          if (url.origin === window.location.origin) start();
        } catch {
          /* noop */
        }
      }
    }

    function onPopState() {
      start();
    }

    document.addEventListener("click", onClick, { capture: true });
    document.addEventListener("submit", onSubmit, { capture: true });
    window.addEventListener("popstate", onPopState);
    return () => {
      document.removeEventListener("click", onClick, { capture: true } as never);
      document.removeEventListener("submit", onSubmit, { capture: true } as never);
      window.removeEventListener("popstate", onPopState);
    };
  }, [start]);

  if (!active) return null;
  return (
    <div className="route-progress" aria-hidden>
      <span />
    </div>
  );
}
