import "server-only";
import { db } from "@/lib/db";
import { SETTINGS } from "@/lib/settings-keys";
import { getSettings } from "@/lib/settings";

export type SiteMeta = {
  name: string;
  description: string;
  footer: string;
  keywords: string[];
};

export async function getSiteMeta(): Promise<SiteMeta> {
  const raw = await getSettings([
    SETTINGS.SITE_NAME,
    SETTINGS.SITE_DESCRIPTION,
    SETTINGS.SITE_FOOTER,
    SETTINGS.SITE_KEYWORDS,
  ]);
  return {
    name: (raw[SETTINGS.SITE_NAME] as string) || "Blog",
    description: (raw[SETTINGS.SITE_DESCRIPTION] as string) || "",
    footer: (raw[SETTINGS.SITE_FOOTER] as string) || "Built with Next.js.",
    keywords: (raw[SETTINGS.SITE_KEYWORDS] as string[]) || [],
  };
}

export async function getNavItems() {
  return db.navItem.findMany({
    where: { parentId: null },
    orderBy: { position: "asc" },
    include: { children: { orderBy: { position: "asc" } } },
  });
}

export async function getRegistrationPolicy() {
  const raw = await getSettings([
    SETTINGS.REGISTRATION_OPEN,
    SETTINGS.REGISTRATION_NEEDS_APPROVAL,
  ]);
  return {
    open: Boolean(raw[SETTINGS.REGISTRATION_OPEN] ?? true),
    needsApproval: Boolean(raw[SETTINGS.REGISTRATION_NEEDS_APPROVAL] ?? false),
  };
}

export async function getCommentPolicy() {
  const raw = await getSettings([
    SETTINGS.COMMENT_NEEDS_APPROVAL,
    SETTINGS.COMMENT_ALLOW_ANONYMOUS,
  ]);
  return {
    needsApproval: Boolean(raw[SETTINGS.COMMENT_NEEDS_APPROVAL] ?? false),
    allowAnonymous: Boolean(raw[SETTINGS.COMMENT_ALLOW_ANONYMOUS] ?? true),
  };
}

export async function getCustomCss(): Promise<string> {
  const raw = await getSettings([SETTINGS.CUSTOM_CSS]);
  return (raw[SETTINGS.CUSTOM_CSS] as string) || "";
}
