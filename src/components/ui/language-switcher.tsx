"use client";

import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Languages, Check } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  LOCALES,
  LOCALE_COOKIE,
  LOCALE_LABELS,
  useT,
  type Locale,
} from "@/components/i18n-provider";

export function LanguageSwitcher() {
  const router = useRouter();
  const { locale, t } = useT();

  function apply(next: Locale) {
    if (next === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    router.refresh();
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={t("switcher.lang.aria")}
          className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-canvas)]"
        >
          <Languages className="h-4 w-4" aria-hidden />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="min-w-[160px] rounded-[var(--radius-md)] bg-[var(--color-elevated)] p-1 shadow-[var(--shadow-elevated),inset_0_0_0_1px_var(--color-border)]"
        >
          <DropdownMenu.Label className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--color-foreground-subtle)]">
            {t("switcher.lang.label")}
          </DropdownMenu.Label>
          {LOCALES.map((l) => (
            <DropdownMenu.Item
              key={l}
              onSelect={() => apply(l)}
              className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 text-sm outline-none transition-colors text-[var(--color-foreground)] hover:bg-[var(--color-muted)] data-[highlighted]:bg-[var(--color-muted)]"
            >
              <span className="flex-1">{LOCALE_LABELS[l]}</span>
              {locale === l ? <Check className="h-3.5 w-3.5 text-[var(--color-primary)]" aria-hidden /> : null}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
