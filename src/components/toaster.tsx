"use client";

import { Toaster as Sonner } from "sonner";
import { useTheme } from "next-themes";

/** Mounted only where toasts are used, so plain reading pages skip sonner. */
export function Toaster() {
  const { resolvedTheme } = useTheme();
  return <Sonner position="bottom-right" closeButton theme={resolvedTheme === "dark" ? "dark" : "light"} />;
}
