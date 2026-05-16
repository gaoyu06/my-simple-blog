import "server-only";
import { cookies } from "next/headers";
import { dictionaries, en, type DictKey } from "@/lib/i18n-dict";

export const LOCALES = ["en", "zh"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "bc-lang";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  zh: "简体中文",
};

export function isLocale(v: unknown): v is Locale {
  return typeof v === "string" && (LOCALES as readonly string[]).includes(v);
}

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k: string) => {
    const v = vars[k];
    return v === undefined || v === null ? "" : String(v);
  });
}

export function translate(locale: Locale, key: DictKey, vars?: Record<string, string | number>): string {
  const dict = dictionaries[locale] ?? en;
  const template = (dict as Record<string, string>)[key] ?? (en as Record<string, string>)[key] ?? key;
  return interpolate(template, vars);
}

export type Translator = (key: DictKey, vars?: Record<string, string | number>) => string;

export async function getT(): Promise<{ locale: Locale; t: Translator }> {
  const locale = await getLocale();
  return { locale, t: (key, vars) => translate(locale, key, vars) };
}
