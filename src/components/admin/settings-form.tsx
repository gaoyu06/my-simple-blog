"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useT } from "@/components/i18n-provider";
import { updateSettings } from "@/server/actions/settings";
import { SETTINGS } from "@/lib/settings-keys";

interface Initial {
  siteName: string;
  siteDescription: string;
  siteFooter: string;
  keywords: string;
  registrationOpen: boolean;
  registrationNeedsApproval: boolean;
  commentNeedsApproval: boolean;
  commentAllowAnonymous: boolean;
  heroEyebrow: string;
  heroTitle: string;
  heroLede: string;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
}

export function SettingsForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const { t } = useT();
  const [data, setData] = React.useState(initial);
  const [saving, setSaving] = React.useState(false);

  async function onSave() {
    setSaving(true);
    const result = await updateSettings({
      [SETTINGS.SITE_NAME]: data.siteName,
      [SETTINGS.SITE_DESCRIPTION]: data.siteDescription,
      [SETTINGS.SITE_FOOTER]: data.siteFooter,
      [SETTINGS.SITE_KEYWORDS]: data.keywords.split(",").map((s) => s.trim()).filter(Boolean),
      [SETTINGS.REGISTRATION_OPEN]: data.registrationOpen,
      [SETTINGS.REGISTRATION_NEEDS_APPROVAL]: data.registrationNeedsApproval,
      [SETTINGS.COMMENT_NEEDS_APPROVAL]: data.commentNeedsApproval,
      [SETTINGS.COMMENT_ALLOW_ANONYMOUS]: data.commentAllowAnonymous,
      [SETTINGS.HOME_HERO_EYEBROW]: data.heroEyebrow,
      [SETTINGS.HOME_HERO_TITLE]: data.heroTitle,
      [SETTINGS.HOME_HERO_LEDE]: data.heroLede,
      [SETTINGS.HOME_CTA_PRIMARY_LABEL]: data.ctaPrimaryLabel,
      [SETTINGS.HOME_CTA_PRIMARY_HREF]: data.ctaPrimaryHref,
      [SETTINGS.HOME_CTA_SECONDARY_LABEL]: data.ctaSecondaryLabel,
      [SETTINGS.HOME_CTA_SECONDARY_HREF]: data.ctaSecondaryHref,
    });
    setSaving(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(t("admin.settings.saved"));
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <Tabs defaultValue="identity">
        <TabsList>
          <TabsTrigger value="identity">{t("admin.settings.tab.identity")}</TabsTrigger>
          <TabsTrigger value="home">{t("admin.settings.tab.home")}</TabsTrigger>
          <TabsTrigger value="registration">{t("admin.settings.tab.registration")}</TabsTrigger>
          <TabsTrigger value="comments">{t("admin.settings.tab.comments")}</TabsTrigger>
        </TabsList>

        <TabsContent value="identity" className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="s-name">{t("admin.settings.field.siteName")}</Label>
            <Input
              id="s-name"
              value={data.siteName}
              onChange={(e) => setData({ ...data, siteName: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="s-desc">{t("admin.settings.field.description")}</Label>
            <Textarea
              id="s-desc"
              value={data.siteDescription}
              onChange={(e) => setData({ ...data, siteDescription: e.target.value })}
              rows={2}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="s-footer">{t("admin.settings.field.footer")}</Label>
            <Input
              id="s-footer"
              value={data.siteFooter}
              onChange={(e) => setData({ ...data, siteFooter: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="s-kw">{t("admin.settings.field.keywords")}</Label>
            <Input
              id="s-kw"
              value={data.keywords}
              onChange={(e) => setData({ ...data, keywords: e.target.value })}
            />
          </div>
        </TabsContent>

        <TabsContent value="home" className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="h-eyebrow">{t("admin.settings.field.heroEyebrow")}</Label>
            <Input
              id="h-eyebrow"
              value={data.heroEyebrow}
              onChange={(e) => setData({ ...data, heroEyebrow: e.target.value })}
              placeholder={t("admin.settings.field.heroEyebrowPlaceholder", { name: "{name}" })}
            />
            <p className="text-xs text-[var(--color-foreground-subtle)]">
              {t("admin.settings.field.heroEyebrowHint")}
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="h-title">{t("admin.settings.field.heroTitle")}</Label>
            <Textarea
              id="h-title"
              value={data.heroTitle}
              onChange={(e) => setData({ ...data, heroTitle: e.target.value })}
              rows={3}
            />
            <p className="text-xs text-[var(--color-foreground-subtle)]">
              {t("admin.settings.field.heroTitleHint")}
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="h-lede">{t("admin.settings.field.heroLede")}</Label>
            <Textarea
              id="h-lede"
              value={data.heroLede}
              onChange={(e) => setData({ ...data, heroLede: e.target.value })}
              rows={2}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cta1-label">{t("admin.settings.field.ctaPrimaryLabel")}</Label>
              <Input
                id="cta1-label"
                value={data.ctaPrimaryLabel}
                onChange={(e) => setData({ ...data, ctaPrimaryLabel: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cta1-href">{t("admin.settings.field.ctaPrimaryHref")}</Label>
              <Input
                id="cta1-href"
                value={data.ctaPrimaryHref}
                onChange={(e) => setData({ ...data, ctaPrimaryHref: e.target.value })}
                placeholder="/archive"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cta2-label">{t("admin.settings.field.ctaSecondaryLabel")}</Label>
              <Input
                id="cta2-label"
                value={data.ctaSecondaryLabel}
                onChange={(e) => setData({ ...data, ctaSecondaryLabel: e.target.value })}
                placeholder={t("admin.settings.field.ctaSecondaryLabelPlaceholder")}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cta2-href">{t("admin.settings.field.ctaSecondaryHref")}</Label>
              <Input
                id="cta2-href"
                value={data.ctaSecondaryHref}
                onChange={(e) => setData({ ...data, ctaSecondaryHref: e.target.value })}
                placeholder="/categories"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="registration" className="flex flex-col gap-3 text-sm">
          <label className="flex items-start gap-3 rounded-[var(--radius-md)] bg-[var(--color-surface)] p-3 shadow-[inset_0_0_0_1px_var(--color-border)]">
            <input
              type="checkbox"
              checked={data.registrationOpen}
              onChange={(e) => setData({ ...data, registrationOpen: e.target.checked })}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-primary)]"
            />
            <span>
              <span className="block font-medium text-[var(--color-foreground)]">
                {t("admin.settings.registration.allow")}
              </span>
              <span className="block text-xs text-[var(--color-foreground-muted)]">
                {t("admin.settings.registration.allowHint")}
              </span>
            </span>
          </label>
          <label className="flex items-start gap-3 rounded-[var(--radius-md)] bg-[var(--color-surface)] p-3 shadow-[inset_0_0_0_1px_var(--color-border)]">
            <input
              type="checkbox"
              checked={data.registrationNeedsApproval}
              onChange={(e) => setData({ ...data, registrationNeedsApproval: e.target.checked })}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-primary)]"
            />
            <span>
              <span className="block font-medium text-[var(--color-foreground)]">
                {t("admin.settings.registration.approval")}
              </span>
              <span className="block text-xs text-[var(--color-foreground-muted)]">
                {t("admin.settings.registration.approvalHint")}
              </span>
            </span>
          </label>
        </TabsContent>

        <TabsContent value="comments" className="flex flex-col gap-3 text-sm">
          <label className="flex items-start gap-3 rounded-[var(--radius-md)] bg-[var(--color-surface)] p-3 shadow-[inset_0_0_0_1px_var(--color-border)]">
            <input
              type="checkbox"
              checked={data.commentAllowAnonymous}
              onChange={(e) => setData({ ...data, commentAllowAnonymous: e.target.checked })}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-primary)]"
            />
            <span>
              <span className="block font-medium text-[var(--color-foreground)]">
                {t("admin.settings.comments.anonymous")}
              </span>
              <span className="block text-xs text-[var(--color-foreground-muted)]">
                {t("admin.settings.comments.anonymousHint")}
              </span>
            </span>
          </label>
          <label className="flex items-start gap-3 rounded-[var(--radius-md)] bg-[var(--color-surface)] p-3 shadow-[inset_0_0_0_1px_var(--color-border)]">
            <input
              type="checkbox"
              checked={data.commentNeedsApproval}
              onChange={(e) => setData({ ...data, commentNeedsApproval: e.target.checked })}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-primary)]"
            />
            <span>
              <span className="block font-medium text-[var(--color-foreground)]">
                {t("admin.settings.comments.approval")}
              </span>
              <span className="block text-xs text-[var(--color-foreground-muted)]">
                {t("admin.settings.comments.approvalHint")}
              </span>
            </span>
          </label>
        </TabsContent>
      </Tabs>
      <Button onClick={onSave} loading={saving} className="mt-2 self-start">
        {t("admin.settings.save")}
      </Button>
    </div>
  );
}
