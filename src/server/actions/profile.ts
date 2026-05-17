"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

const profileSchema = z.object({
  name: z.string().trim().max(80).optional().nullable(),
  username: z
    .string()
    .trim()
    .min(2)
    .max(40)
    .regex(/^[A-Za-z0-9_-]+$/, "Letters, digits, '-' and '_' only")
    .optional()
    .nullable()
    .or(z.literal("").transform(() => null)),
  bio: z.string().trim().max(500).optional().nullable(),
  image: z
    .string()
    .trim()
    .max(2048)
    .regex(/^(https?:\/\/|\/)/, "Must be an absolute URL or a path starting with '/'")
    .optional()
    .nullable()
    .or(z.literal("").transform(() => null)),
});

export async function updateProfile(input: unknown) {
  const session = await auth();
  if (!session?.user?.id) return { ok: false as const, error: "Not signed in." };
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) fields[issue.path.join(".")] = issue.message;
    return { ok: false as const, error: "Validation failed.", fields };
  }
  const { name, username, bio, image } = parsed.data;

  if (username) {
    const taken = await db.user.findFirst({
      where: { username, NOT: { id: session.user.id } },
      select: { id: true },
    });
    if (taken) {
      return { ok: false as const, error: "Username already in use.", fields: { username: "Already in use" } };
    }
  }

  try {
    await db.user.update({
      where: { id: session.user.id },
      data: {
        name: name ?? null,
        username: username ?? null,
        bio: bio ?? null,
        image: image ?? null,
      },
    });
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : "Internal error" };
  }

  revalidatePath("/account");
  return { ok: true as const };
}
