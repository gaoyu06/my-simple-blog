import { db } from "@/lib/db";
import { SETTINGS, type SettingKey } from "@/lib/settings-keys";

export async function getSetting<T = unknown>(key: SettingKey | string, fallback?: T): Promise<T> {
  const row = await db.setting.findUnique({ where: { key } });
  if (!row) return fallback as T;
  try {
    return JSON.parse(row.value) as T;
  } catch {
    return row.value as unknown as T;
  }
}

export async function setSetting(key: SettingKey | string, value: unknown): Promise<void> {
  const serialized = JSON.stringify(value);
  await db.setting.upsert({
    where: { key },
    update: { value: serialized },
    create: { key, value: serialized },
  });
}

export async function getSettings<K extends string>(keys: readonly K[]): Promise<Record<K, unknown>> {
  const rows = await db.setting.findMany({ where: { key: { in: keys as unknown as string[] } } });
  const map = Object.fromEntries(
    rows.map((row) => {
      try {
        return [row.key, JSON.parse(row.value)];
      } catch {
        return [row.key, row.value];
      }
    }),
  ) as Record<string, unknown>;
  const result = {} as Record<K, unknown>;
  for (const key of keys) {
    result[key] = map[key];
  }
  return result;
}

export { SETTINGS };
