import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { SettingsForm } from "@/components/admin/settings-form";
import { getSettings } from "@/lib/settings";
import { SETTINGS } from "@/lib/settings-keys";
import { getT } from "@/lib/i18n";

export const metadata = { title: "Settings" };

export default async function SettingsAdmin() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/admin");
  const [raw, { t }] = await Promise.all([
    getSettings([
      SETTINGS.SITE_NAME,
      SETTINGS.SITE_DESCRIPTION,
      SETTINGS.SITE_FOOTER,
      SETTINGS.SITE_KEYWORDS,
      SETTINGS.REGISTRATION_OPEN,
      SETTINGS.REGISTRATION_NEEDS_APPROVAL,
      SETTINGS.COMMENT_NEEDS_APPROVAL,
      SETTINGS.COMMENT_ALLOW_ANONYMOUS,
      SETTINGS.HOME_HERO_EYEBROW,
      SETTINGS.HOME_HERO_TITLE,
      SETTINGS.HOME_HERO_LEDE,
      SETTINGS.HOME_CTA_PRIMARY_LABEL,
      SETTINGS.HOME_CTA_PRIMARY_HREF,
      SETTINGS.HOME_CTA_SECONDARY_LABEL,
      SETTINGS.HOME_CTA_SECONDARY_HREF,
    ]),
    getT(),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8">
        <p className="eyebrow mb-1">{t("admin.settings.eyebrow")}</p>
        <h1 className="font-serif text-3xl font-medium tracking-tight">{t("admin.settings.title")}</h1>
      </div>
      <Card>
        <CardContent className="pt-6">
          <SettingsForm
            initial={{
              siteName: (raw[SETTINGS.SITE_NAME] as string) || "Blog",
              siteDescription: (raw[SETTINGS.SITE_DESCRIPTION] as string) || "",
              siteFooter: (raw[SETTINGS.SITE_FOOTER] as string) || "",
              keywords: ((raw[SETTINGS.SITE_KEYWORDS] as string[]) || []).join(", "),
              registrationOpen: Boolean(raw[SETTINGS.REGISTRATION_OPEN] ?? true),
              registrationNeedsApproval: Boolean(raw[SETTINGS.REGISTRATION_NEEDS_APPROVAL] ?? false),
              commentNeedsApproval: Boolean(raw[SETTINGS.COMMENT_NEEDS_APPROVAL] ?? false),
              commentAllowAnonymous: Boolean(raw[SETTINGS.COMMENT_ALLOW_ANONYMOUS] ?? true),
              heroEyebrow: (raw[SETTINGS.HOME_HERO_EYEBROW] as string) || "",
              heroTitle: (raw[SETTINGS.HOME_HERO_TITLE] as string) || "",
              heroLede: (raw[SETTINGS.HOME_HERO_LEDE] as string) || "",
              ctaPrimaryLabel: (raw[SETTINGS.HOME_CTA_PRIMARY_LABEL] as string) || "",
              ctaPrimaryHref: (raw[SETTINGS.HOME_CTA_PRIMARY_HREF] as string) || "",
              ctaSecondaryLabel: (raw[SETTINGS.HOME_CTA_SECONDARY_LABEL] as string) || "",
              ctaSecondaryHref: (raw[SETTINGS.HOME_CTA_SECONDARY_HREF] as string) || "",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
