import "server-only";

export type DbKind = "sqlite" | "postgresql" | "unknown";

/** Identify the DB backend by inspecting DATABASE_URL. */
export function detectDbKind(url = process.env.DATABASE_URL ?? ""): DbKind {
  if (/^postgres(ql)?:\/\//i.test(url)) return "postgresql";
  if (/^file:/i.test(url) || /\.db(\?|$)/i.test(url)) return "sqlite";
  return "unknown";
}

/** Hide the password in a connection string before exposing it to the UI. */
export function redactedDbUrl(url = process.env.DATABASE_URL ?? ""): string {
  if (!url) return "";
  return url.replace(/(:\/\/[^:@/]+:)([^@]+)(@)/, (_, a, _b, c) => `${a}••••${c}`);
}

export const DB_KIND_LABEL: Record<DbKind, string> = {
  sqlite: "SQLite",
  postgresql: "PostgreSQL",
  unknown: "Unknown",
};
