"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { setSetting } from "@/lib/settings";

export async function updateSettings(values: Record<string, unknown>) {
  const session = await auth();
  if (!isAdmin(session)) return { ok: false as const, error: "Not authorized." };
  for (const [key, value] of Object.entries(values)) {
    await setSetting(key, value);
  }
  revalidatePath("/", "layout");
  return { ok: true as const };
}
