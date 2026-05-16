"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

/**
 * Re-keys children on pathname change so route-level mount triggers
 * a fade/translate-in via the .page-enter CSS animation.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  );
}
