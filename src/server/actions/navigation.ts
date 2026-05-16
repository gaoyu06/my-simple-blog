"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";

const itemSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1).max(60),
  href: z.string().min(1).max(300),
  position: z.coerce.number().int().min(0).default(0),
  external: z.coerce.boolean().default(false),
  parentId: z.string().optional().nullable(),
});

export async function saveNavItem(input: unknown) {
  const session = await auth();
  if (!isAdmin(session)) return { ok: false as const, error: "Not authorized." };
  const parsed = itemSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Validation failed." };
  const data = parsed.data;

  if (data.id) {
    await db.navItem.update({
      where: { id: data.id },
      data: {
        label: data.label,
        href: data.href,
        position: data.position,
        external: data.external,
        parentId: data.parentId ?? null,
      },
    });
  } else {
    await db.navItem.create({
      data: {
        label: data.label,
        href: data.href,
        position: data.position,
        external: data.external,
        parentId: data.parentId ?? null,
      },
    });
  }
  revalidatePath("/", "layout");
  revalidatePath("/admin/navigation");
  return { ok: true as const };
}

export async function deleteNavItem(id: string) {
  const session = await auth();
  if (!isAdmin(session)) return { ok: false as const, error: "Not authorized." };
  await db.navItem.delete({ where: { id } });
  revalidatePath("/", "layout");
  revalidatePath("/admin/navigation");
  return { ok: true as const };
}

export async function reorderNavItems(ids: string[]) {
  const session = await auth();
  if (!isAdmin(session)) return { ok: false as const, error: "Not authorized." };
  await db.$transaction(
    ids.map((id, index) => db.navItem.update({ where: { id }, data: { position: index } })),
  );
  revalidatePath("/", "layout");
  revalidatePath("/admin/navigation");
  return { ok: true as const };
}
