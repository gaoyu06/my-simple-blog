"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

import { db } from "@/lib/db";
import { signIn, signOut } from "@/lib/auth";
import { getSetting, SETTINGS } from "@/lib/settings";

const registerSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1).max(64).optional(),
  username: z
    .string()
    .min(2)
    .max(32)
    .regex(/^[a-z0-9_-]+$/, "Use lowercase letters, digits, '-' or '_'")
    .optional(),
});

export type ActionResult<T = unknown> =
  | { ok: true; data?: T }
  | { ok: false; error: string; fields?: Record<string, string> };

export async function registerAction(formData: FormData): Promise<ActionResult> {
  const open = await getSetting<boolean>(SETTINGS.REGISTRATION_OPEN, true);
  if (!open) {
    return { ok: false, error: "Registration is closed." };
  }
  const needsApproval = await getSetting<boolean>(SETTINGS.REGISTRATION_NEEDS_APPROVAL, false);

  const parsed = registerSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fields[issue.path.join(".")] = issue.message;
    }
    return { ok: false, error: "Validation failed", fields };
  }

  const { email, password, name, username } = parsed.data;
  const existing = await db.user.findFirst({
    where: { OR: [{ email }, ...(username ? [{ username }] : [])] },
  });
  if (existing) {
    return { ok: false, error: "Email or username is already taken." };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await db.user.create({
    data: {
      email,
      passwordHash,
      name: name ?? null,
      username: username ?? null,
      role: "GUEST",
      status: needsApproval ? "PENDING" : "ACTIVE",
    },
  });

  if (needsApproval) {
    return { ok: true, data: { needsApproval: true } };
  }

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (e) {
    if (e instanceof AuthError) {
      return { ok: false, error: "Account created but auto sign-in failed. Please sign in manually." };
    }
    throw e;
  }
  return { ok: true };
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  redirectTo: z.string().optional(),
});

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { ok: false, error: "Invalid email or password." };
  }
  const { email, password, redirectTo } = parsed.data;
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: redirectTo || "/",
    });
    return { ok: true };
  } catch (e) {
    if (e instanceof AuthError) {
      return { ok: false, error: "Invalid email or password." };
    }
    throw e;
  }
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}
