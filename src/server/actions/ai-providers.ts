"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { encryptSecret } from "@/lib/crypto";

const upsertSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(80),
  kind: z.enum(["LLM", "IMAGE"]),
  baseUrl: z.string().url().or(z.literal("").transform(() => "")),
  model: z.string().min(1).max(120),
  apiKey: z.string().optional(),
  isDefault: z.coerce.boolean().default(false),
  enabled: z.coerce.boolean().default(true),
  extra: z.string().optional(),
});

export async function saveProvider(input: unknown) {
  const session = await auth();
  if (!isAdmin(session)) return { ok: false as const, error: "Not authorized." };
  const parsed = upsertSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Validation failed." };
  const data = parsed.data;

  if (data.isDefault) {
    await db.aIProvider.updateMany({ where: { kind: data.kind, isDefault: true }, data: { isDefault: false } });
  }

  if (data.id) {
    const existing = await db.aIProvider.findUnique({ where: { id: data.id } });
    if (!existing) return { ok: false as const, error: "Not found." };
    await db.aIProvider.update({
      where: { id: data.id },
      data: {
        name: data.name,
        kind: data.kind,
        baseUrl: data.baseUrl,
        model: data.model,
        apiKeyEnc: data.apiKey ? encryptSecret(data.apiKey) : existing.apiKeyEnc,
        isDefault: data.isDefault,
        enabled: data.enabled,
        extra: data.extra ?? null,
      },
    });
  } else {
    if (!data.apiKey) return { ok: false as const, error: "API key is required for new providers." };
    await db.aIProvider.create({
      data: {
        name: data.name,
        kind: data.kind,
        baseUrl: data.baseUrl,
        model: data.model,
        apiKeyEnc: encryptSecret(data.apiKey),
        isDefault: data.isDefault,
        enabled: data.enabled,
        extra: data.extra ?? null,
      },
    });
  }

  revalidatePath("/admin/ai");
  return { ok: true as const };
}

export async function deleteProvider(id: string) {
  const session = await auth();
  if (!isAdmin(session)) return { ok: false as const, error: "Not authorized." };
  await db.aIProvider.delete({ where: { id } });
  revalidatePath("/admin/ai");
  return { ok: true as const };
}
