"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

import { db } from "@/lib/db";
import { signIn } from "@/lib/auth";
import { setSetting } from "@/lib/settings";
import { SETTINGS } from "@/lib/settings-keys";
import { COLOR_THEME_COOKIE, isColorTheme } from "@/lib/color-theme";
import { LOCALE_COOKIE, isLocale } from "@/lib/i18n";
import { encryptSecret } from "@/lib/crypto";
import { isInitialized } from "@/lib/install-state";

const schema = z.object({
  site: z.object({
    name: z.string().min(1).max(120),
    description: z.string().max(500).optional().default(""),
  }),
  locale: z.string(),
  color: z.string(),
  admin: z
    .object({
      email: z.string().email(),
      password: z.string().min(8),
      name: z.string().min(1).max(80).optional(),
    })
    .optional(),
  ai: z
    .object({
      name: z.string().min(1).max(80),
      kind: z.enum(["LLM", "IMAGE"]),
      baseUrl: z.string().url().or(z.literal("")),
      model: z.string().min(1).max(120),
      apiKey: z.string().min(1),
    })
    .optional(),
});

export type SetupResult =
  | { ok: true; signedIn: boolean }
  | { ok: false; error: string };

export async function completeSetup(input: unknown): Promise<SetupResult> {
  if (await isInitialized()) {
    return { ok: false, error: "Setup already completed." };
  }
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Validation failed." };
  }
  const data = parsed.data;

  // Persist site identity + i18n/color defaults.
  await Promise.all([
    setSetting(SETTINGS.SITE_NAME, data.site.name),
    setSetting(SETTINGS.SITE_DESCRIPTION, data.site.description ?? ""),
  ]);

  // Create the admin if no admin user exists yet. Otherwise, fast path:
  // we assume the legacy seed admin is fine and just mark setup complete.
  let signedIn = false;
  const existingAdmin = await db.user.findFirst({ where: { role: "ADMIN" } });
  if (!existingAdmin) {
    if (!data.admin) {
      return { ok: false, error: "Admin account is required on first setup." };
    }
    const conflict = await db.user.findUnique({ where: { email: data.admin.email } });
    if (conflict) return { ok: false, error: "An account with that email already exists." };

    const passwordHash = await bcrypt.hash(data.admin.password, 12);
    await db.user.create({
      data: {
        email: data.admin.email,
        name: data.admin.name ?? null,
        passwordHash,
        role: "ADMIN",
        status: "ACTIVE",
      },
    });

    try {
      await signIn("credentials", {
        email: data.admin.email,
        password: data.admin.password,
        redirect: false,
      });
      signedIn = true;
    } catch {
      signedIn = false;
    }
  }

  // Seed a default category + nav items if the database is empty (fresh install).
  const categoryCount = await db.category.count();
  if (categoryCount === 0) {
    await db.category.create({
      data: { slug: "general", name: "General", description: "Default category." },
    });
  }
  const navCount = await db.navItem.count();
  if (navCount === 0) {
    await db.navItem.createMany({
      data: [
        { label: "Home", href: "/", position: 0 },
        { label: "Archive", href: "/archive", position: 1 },
        { label: "Categories", href: "/categories", position: 2 },
        { label: "Tags", href: "/tags", position: 3 },
      ],
    });
  }

  // Optional AI provider.
  if (data.ai) {
    await db.aIProvider.create({
      data: {
        name: data.ai.name,
        kind: data.ai.kind,
        baseUrl: data.ai.baseUrl,
        model: data.ai.model,
        apiKeyEnc: encryptSecret(data.ai.apiKey),
        isDefault: true,
        enabled: true,
      },
    });
  }

  // Mark complete + write user prefs as cookies so the chosen locale/color
  // take effect on the very next render.
  await setSetting(SETTINGS.SETUP_COMPLETED, true);

  const store = await cookies();
  if (isLocale(data.locale)) {
    store.set(LOCALE_COOKIE, data.locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }
  if (isColorTheme(data.color)) {
    store.set(COLOR_THEME_COOKIE, data.color, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  return { ok: true, signedIn };
}

/** Whether the wizard needs to ask the user to create an admin account. */
export async function isAdminMissing(): Promise<boolean> {
  const adminCount = await db.user.count({ where: { role: "ADMIN" } });
  return adminCount === 0;
}
