"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";

const updateSchema = z.object({
  id: z.string().min(1),
  role: z.enum(["ADMIN", "AUTHOR", "GUEST"]).optional(),
  status: z.enum(["PENDING", "ACTIVE", "BANNED"]).optional(),
});

export async function updateUser(input: unknown) {
  const session = await auth();
  if (!isAdmin(session)) return { ok: false as const, error: "Not authorized." };
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Validation failed." };
  const { id, role, status } = parsed.data;
  if (id === session!.user.id && role && role !== "ADMIN") {
    return { ok: false as const, error: "Cannot demote your own admin role." };
  }
  await db.user.update({
    where: { id },
    data: {
      ...(role ? { role } : {}),
      ...(status ? { status } : {}),
    },
  });
  revalidatePath("/admin/users");
  return { ok: true as const };
}

export async function deleteUser(id: string) {
  const session = await auth();
  if (!isAdmin(session)) return { ok: false as const, error: "Not authorized." };
  if (id === session!.user.id) return { ok: false as const, error: "Cannot delete your own account." };
  await db.user.delete({ where: { id } });
  revalidatePath("/admin/users");
  return { ok: true as const };
}
