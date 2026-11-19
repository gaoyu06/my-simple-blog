"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

/** Icons swap through the `dark` class, so no mount check is needed. */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button
      type="button"
      aria-label="切换明暗模式"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-foreground-muted)] transition-colors hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]"
    >
      <Sun className="h-4 w-4 dark:hidden" aria-hidden />
      <Moon className="hidden h-4 w-4 dark:block" aria-hidden />
    </button>
  );
}
