/**
 * Per-locale name/description overrides for taxonomy items (Category, Tag).
 *
 * Stored as a JSON string in the `translations` column with shape:
 *   { "<locale>": { "name"?: string; "description"?: string } }
 *
 * The base `name` and `description` columns remain the canonical fallback —
 * what the user typed first / what gets shown if no translation matches.
 */

export interface TaxonomyTranslation {
  name?: string;
  description?: string;
}

export type TaxonomyTranslationMap = Record<string, TaxonomyTranslation>;

export function parseTranslations(raw: string | null | undefined): TaxonomyTranslationMap {
  if (!raw) return {};
  try {
    const v = JSON.parse(raw);
    if (v && typeof v === "object" && !Array.isArray(v)) return v as TaxonomyTranslationMap;
  } catch {
    /* fall through */
  }
  return {};
}

export function serializeTranslations(map: TaxonomyTranslationMap): string | null {
  // Drop locales with no usable content so we don't store {"en":{}} bloat.
  const cleaned: TaxonomyTranslationMap = {};
  for (const [loc, val] of Object.entries(map)) {
    const name = val?.name?.trim();
    const description = val?.description?.trim();
    if (name || description) {
      cleaned[loc] = {};
      if (name) cleaned[loc].name = name;
      if (description) cleaned[loc].description = description;
    }
  }
  return Object.keys(cleaned).length ? JSON.stringify(cleaned) : null;
}

export function localizedName(
  item: { name: string; translations?: string | null },
  locale: string,
): string {
  const map = parseTranslations(item.translations);
  return map[locale]?.name?.trim() || item.name;
}

export function localizedDescription(
  item: { description?: string | null; translations?: string | null },
  locale: string,
): string | null {
  const map = parseTranslations(item.translations);
  return map[locale]?.description?.trim() || item.description || null;
}
