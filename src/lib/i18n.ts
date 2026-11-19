import { zh, type DictKey } from "@/lib/i18n-dict";

// The site is Chinese-only. `Locale` stays as a type because taxonomy
// translations are still stored per locale.
export const LOCALES = ["en", "zh"] as const;
export type Locale = (typeof LOCALES)[number];
export const LOCALE: Locale = "zh";

export type Translator = (key: DictKey, vars?: Record<string, string | number>) => string;

export const t: Translator = (key, vars) => {
  const template: string = zh[key] ?? key;
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));
};

/** Kept async-compatible for existing server callers. */
export async function getT(): Promise<{ locale: Locale; t: Translator }> {
  return { locale: LOCALE, t };
}
