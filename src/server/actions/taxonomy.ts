"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { makeSlug } from "@/lib/markdown";
import { serializeTranslations, type TaxonomyTranslationMap } from "@/lib/taxonomy-i18n";

const translationSchema = z
  .record(
    z.string(),
    z.object({ name: z.string().optional(), description: z.string().optional() }),
  )
  .optional();

const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(80),
  slug: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(500).optional().nullable(),
  parentId: z.string().optional().nullable(),
  position: z.coerce.number().int().min(0).default(0),
  translations: translationSchema,
});

export async function saveCategory(input: unknown) {
  const session = await auth();
  if (!isAdmin(session)) return { ok: false as const, error: "Not authorized." };
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Validation failed." };
  const data = parsed.data;
  const slug = data.slug ?? makeSlug(data.name);
  const translations = serializeTranslations(
    (data.translations as TaxonomyTranslationMap | undefined) ?? {},
  );

  if (data.id) {
    const conflict = await db.category.findFirst({ where: { slug, NOT: { id: data.id } } });
    if (conflict) return { ok: false as const, error: "Slug already in use." };
    await db.category.update({
      where: { id: data.id },
      data: {
        name: data.name,
        slug,
        description: data.description ?? null,
        parentId: data.parentId ?? null,
        position: data.position,
        translations,
      },
    });
  } else {
    const conflict = await db.category.findFirst({ where: { slug } });
    if (conflict) return { ok: false as const, error: "Slug already in use." };
    await db.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description ?? null,
        parentId: data.parentId ?? null,
        position: data.position,
        translations,
      },
    });
  }
  revalidatePath("/categories");
  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
  return { ok: true as const };
}

export async function deleteCategory(id: string) {
  const session = await auth();
  if (!isAdmin(session)) return { ok: false as const, error: "Not authorized." };
  await db.category.delete({ where: { id } });
  revalidatePath("/categories");
  revalidatePath("/admin/categories");
  return { ok: true as const };
}

export async function deleteTag(id: string) {
  const session = await auth();
  if (!isAdmin(session)) return { ok: false as const, error: "Not authorized." };
  await db.tag.delete({ where: { id } });
  revalidatePath("/tags");
  revalidatePath("/admin/tags");
  return { ok: true as const };
}

const tagUpdateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(80),
  translations: translationSchema,
});

export async function updateTag(input: unknown) {
  const session = await auth();
  if (!isAdmin(session)) return { ok: false as const, error: "Not authorized." };
  const parsed = tagUpdateSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Validation failed." };
  const data = parsed.data;
  const slug = makeSlug(data.name);
  const conflict = await db.tag.findFirst({ where: { slug, NOT: { id: data.id } } });
  if (conflict) return { ok: false as const, error: "Tag with this name already exists." };
  const translations = serializeTranslations(
    (data.translations as TaxonomyTranslationMap | undefined) ?? {},
  );
  await db.tag.update({ where: { id: data.id }, data: { name: data.name, slug, translations } });
  revalidatePath("/tags");
  revalidatePath("/admin/tags");
  return { ok: true as const };
}

// Kept for backwards compatibility — now an alias.
export async function renameTag(id: string, name: string) {
  return updateTag({ id, name });
}
