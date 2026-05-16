"use client";

import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Palette, Check } from "lucide-react";

import {
  COLOR_THEMES,
  COLOR_THEME_COOKIE,
  COLOR_THEME_SWATCH,
  DEFAULT_COLOR_THEME,
  isColorTheme,
  type ColorTheme,
} from "@/lib/color-theme";
import { useT } from "@/components/i18n-provider";
import { cn } from "@/lib/cn";

const COLOR_LABEL_KEYS = {
  pink: "switcher.color.rose",
  mono: "switcher.color.mono",
  blue: "switcher.color.blue",
  green: "switcher.color.green",
} as const;

function readCurrent(): ColorTheme {
  if (typeof document === "undefined") return DEFAULT_COLOR_THEME;
  const v = document.documentElement.dataset.color;
  return isColorTheme(v) ? v : DEFAULT_COLOR_THEME;
}

export function ColorThemeSwitcher() {
  const { t } = useT();
  const [current, setCurrent] = React.useState<ColorTheme>(DEFAULT_COLOR_THEME);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    setCurrent(readCurrent());
  }, []);

  function apply(next: ColorTheme) {
    document.documentElement.dataset.color = next;
    document.cookie = `${COLOR_THEME_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    setCurrent(next);
  }

  const swatchColor = mounted ? COLOR_THEME_SWATCH[current] : COLOR_THEME_SWATCH[DEFAULT_COLOR_THEME];

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={t("switcher.color.aria")}
          className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-canvas)]"
        >
          <span className="relative">
            <Palette className="h-4 w-4" aria-hidden />
            <span
              aria-hidden
              className="absolute -bottom-1 -right-1 h-2 w-2 rounded-full shadow-[inset_0_0_0_1px_oklch(0_0_0/0.20)]"
              style={{ background: swatchColor }}
            />
          </span>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="min-w-[180px] rounded-[var(--radius-md)] bg-[var(--color-elevated)] p-1 shadow-[var(--shadow-elevated),inset_0_0_0_1px_var(--color-border)]"
        >
          <DropdownMenu.Label className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--color-foreground-subtle)]">
            {t("switcher.color.label")}
          </DropdownMenu.Label>
          {COLOR_THEMES.map((c) => (
            <DropdownMenu.Item
              key={c}
              onSelect={() => apply(c)}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 text-sm outline-none transition-colors",
                "text-[var(--color-foreground)] hover:bg-[var(--color-muted)] data-[highlighted]:bg-[var(--color-muted)]",
              )}
            >
              <span
                aria-hidden
                className="h-3.5 w-3.5 shrink-0 rounded-full shadow-[inset_0_0_0_1px_oklch(0_0_0/0.20)]"
                style={{ background: COLOR_THEME_SWATCH[c] }}
              />
              <span className="flex-1">{t(COLOR_LABEL_KEYS[c])}</span>
              {current === c ? <Check className="h-3.5 w-3.5 text-[var(--color-primary)]" aria-hidden /> : null}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
