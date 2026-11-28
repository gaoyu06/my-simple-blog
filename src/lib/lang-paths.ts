/**
 * English pages are Page rows with slug "en/<name>". Their Chinese counterpart
 * has slug "<name>", except where the Chinese slug is not a readable word.
 */
const ZH_SLUG_OF: Record<string, string> = { about: "1758280803991" };
const EN_NAME_OF = Object.fromEntries(Object.entries(ZH_SLUG_OF).map(([en, zh]) => [zh, en]));

export function zhPathOf(enPath: string): string {
  const name = enPath.replace(/^\/en\/?/, "").replace(/\/$/, "");
  if (!name) return "/";
  return `/${ZH_SLUG_OF[name] ?? name}`;
}

/** `enSlugs` are the published English page slugs without the "en/" prefix. */
export function enPathOf(zhPath: string, enSlugs: readonly string[]): string {
  const slug = decodeURIComponent(zhPath.replace(/^\//, "").replace(/\/$/, ""));
  const name = EN_NAME_OF[slug] ?? slug;
  return name && enSlugs.includes(name) ? `/en/${name}` : "/en";
}
