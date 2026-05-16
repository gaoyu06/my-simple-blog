import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Pick the right driver adapter based on the DATABASE_URL scheme:
 *   - postgres:// or postgresql://  → PrismaPg (node-postgres)
 *   - anything else (file:, etc.)   → PrismaBetterSqlite3 (better-sqlite3)
 *
 * NOTE: This selects the runtime adapter. The Prisma schema's `datasource`
 * `provider` still controls the dialect of generated SQL. To use PostgreSQL,
 * also set `provider = "postgresql"` in prisma/schema.prisma and re-run
 * `pnpm db:generate && pnpm db:migrate deploy` against the PG database.
 */
function buildAdapter() {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  if (/^postgres(ql)?:\/\//i.test(url)) {
    return new PrismaPg({ connectionString: url });
  }
  return new PrismaBetterSqlite3({ url });
}

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const db =
  global.__prisma ??
  new PrismaClient({
    adapter: buildAdapter(),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__prisma = db;
}

export type { Prisma } from "@prisma/client";
