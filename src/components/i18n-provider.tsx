"use client";

import { LOCALE, LOCALES, t, type Locale } from "@/lib/i18n";

export { LOCALES, type Locale };
export const LOCALE_LABELS: Record<Locale, string> = { en: "English", zh: "简体中文" };

export function useT() {
  return { locale: LOCALE, t };
}
