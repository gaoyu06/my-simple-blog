import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import { getSetting } from "@/lib/settings";
import { SETTINGS } from "@/lib/settings-keys";

/**
 * Whether first-run setup has been completed.
 *
 * Truth order:
 *   1. The `setup.completed` setting (set when the wizard finishes).
 *   2. Legacy fallback: any active admin user exists (covers installs that
 *      predate the wizard — they skip straight past it).
 *
 * Memoized per request via React.cache, so multiple layouts can call it
 * without each one hitting the DB.
 */
export const isInitialized = cache(async (): Promise<boolean> => {
  try {
    const done = await getSetting<boolean>(SETTINGS.SETUP_COMPLETED, false);
    if (done) return true;
    const adminCount = await db.user.count({ where: { role: "ADMIN" } });
    return adminCount > 0;
  } catch {
    // If the DB isn't reachable / not yet migrated, treat as uninitialized
    // so the wizard can guide the user (the wizard itself surfaces DB errors).
    return false;
  }
});
