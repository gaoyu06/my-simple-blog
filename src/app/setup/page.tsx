import "server-only";

export type DbKind = "sqlite" | "postgresql" | "unknown";

export function detectDbKind(url = process.env.DATABASE_URL ?? ""): DbKind {
  if (/^postgres(ql)?:\/\//i.test(url)) return "postgresql";
  if (/^file:/i.test(url) || /\.db(\?|$)/i.test(url)) return "sqlite";
  return "unknown";
}

/** Friendly redacted DATABASE_URL — strip password before showing in UI. */
export function redactedDbUrl(url = process.env.DATABASE_URL ?? ""): string {
  if (!url) return "";
  return url.replace(/(:\/\/[^:@/]+:)([^@]+)(@)/, (_, a, _b, c) => `${a}••••${c}`);
}
