"use client";

import * as React from "react";
import { dictionaries, en, type DictKey } from "@/lib/i18n-dict";

export const LOCALES = ["en", "zh"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "bc-lang";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  zh: "简体中文",
};

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k: string) => {
    const v = vars[k];
    return v === undefined || v === null ? "" : String(v);
  });
}

type Translator = (key: DictKey, vars?: Record<string, string | number>) => string;

const I18nContext = React.createContext<{ locale: Locale; t: Translator } | null>(null);

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const value = React.useMemo(() => {
    const dict = dictionaries[locale] ?? en;
    const t: Translator = (key, vars) => {
      const template = (dict as Record<string, string>)[key] ?? (en as Record<string, string>)[key] ?? key;
      return interpolate(template, vars);
    };
    return { locale, t };
  }, [locale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useT() {
  const ctx = React.useContext(I18nContext);
  if (!ctx) throw new Error("useT must be used inside <I18nProvider>");
  return ctx;
}
