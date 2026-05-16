"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Code2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { useT } from "@/components/i18n-provider";
import { updateSettings } from "@/server/actions/settings";
import { SETTINGS } from "@/lib/settings-keys";

interface Initial {
  primary: string;
  defaultMode: "system" | "light" | "dark";
  customCss: string;
}

export function ThemeForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const { t } = useT();
  const [primary, setPrimary] = React.useState(initial.primary);
  const [defaultMode, setDefaultMode] = React.useState(initial.defaultMode);
  const [customCss, setCustomCss] = React.useState(initial.customCss);
  const [cssDraft, setCssDraft] = React.useState(initial.customCss);
  const [cssOpen, setCssOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  async function onSave(values?: Partial<Initial>) {
    setSaving(true);
    const merged = {
      primary: values?.primary ?? primary,
      defaultMode: values?.defaultMode ?? defaultMode,
      customCss: values?.customCss ?? customCss,
    };
    const result = await updateSettings({
      [SETTINGS.THEME_PRIMARY]: merged.primary,
      [SETTINGS.THEME_DEFAULT_MODE]: merged.defaultMode,
      [SETTINGS.CUSTOM_CSS]: merged.customCss,
    });
    setSaving(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(t("admin.theme.saved"));
    router.refresh();
  }

  async function onSaveCss() {
    setCustomCss(cssDraft);
    await onSave({ customCss: cssDraft });
    setCssOpen(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="primary">{t("admin.theme.field.primary")}</Label>
          <Input
            id="primary"
            value={primary}
            onChange={(e) => setPrimary(e.target.value)}
            placeholder="oklch(0.74 0.12 8)"
            className="font-mono text-sm"
          />
          <p className="text-xs text-[var(--color-foreground-subtle)]">
            {t("admin.theme.field.primaryHint")}
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="default-mode">{t("admin.theme.field.mode")}</Label>
          <Select
            value={defaultMode}
            onValueChange={(v) => setDefaultMode(v as Initial["defaultMode"])}
          >
            <SelectTrigger id="default-mode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">{t("admin.theme.mode.system")}</SelectItem>
              <SelectItem value="light">{t("admin.theme.mode.light")}</SelectItem>
              <SelectItem value="dark">{t("admin.theme.mode.dark")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center justify-between rounded-[var(--radius-md)] bg-[var(--color-surface)] p-3 shadow-[inset_0_0_0_1px_var(--color-border)]">
        <div>
          <p className="text-sm font-medium text-[var(--color-foreground)]">
            {t("admin.theme.customCss")}
          </p>
          <p className="text-xs text-[var(--color-foreground-muted)]">
            {customCss
              ? t("admin.theme.customCssCount", { count: customCss.length })
              : t("admin.theme.customCssEmpty")}
          </p>
        </div>
        <Dialog
          open={cssOpen}
          onOpenChange={(o) => {
            setCssOpen(o);
            if (o) setCssDraft(customCss);
          }}
        >
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" leftIcon={<Code2 className="h-3.5 w-3.5" />}>
              {t("admin.theme.customCssEdit")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t("admin.theme.customCss")}</DialogTitle>
              <DialogDescription>{t("admin.theme.customCssDialogDesc")}</DialogDescription>
            </DialogHeader>
            <Textarea
              value={cssDraft}
              onChange={(e) => setCssDraft(e.target.value)}
              rows={18}
              placeholder={`:root {\n  --color-primary: oklch(0.62 0.14 50);\n}`}
              className="font-mono text-xs"
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost">{t("common.cancel")}</Button>
              </DialogClose>
              <Button onClick={onSaveCss} loading={saving}>
                {t("admin.theme.customCssSave")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Button onClick={() => onSave()} loading={saving} className="self-start">
        {t("admin.theme.save")}
      </Button>
    </div>
  );
}
