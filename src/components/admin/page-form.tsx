"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
import { useT } from "@/components/i18n-provider";
import { savePage, deletePage } from "@/server/actions/pages";

interface Initial {
  id?: string;
  slug: string;
  title: string;
  description: string;
  contentType: "MARKDOWN" | "HTML";
  content: string;
  published: boolean;
  position: number;
}

export function PageForm({ initial }: { initial: Initial }) {
  const router = useRouter();
  const { t } = useT();
  const [data, setData] = React.useState<Initial>(initial);
  const [saving, setSaving] = React.useState(false);

  async function onSave() {
    setSaving(true);
    const result = await savePage(data);
    setSaving(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(t("common.saved"));
    if (!initial.id) router.push("/admin/pages");
    else router.refresh();
  }

  async function onDelete() {
    if (!initial.id) return;
    if (!confirm(t("admin.pages.confirmDelete"))) return;
    const result = await deletePage(initial.id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(t("common.deleted"));
    router.push("/admin/pages");
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-6 py-8 lg:grid-cols-[1fr_280px]">
      <div className="flex flex-col gap-4">
        <Input
          value={data.title}
          onChange={(e) => setData({ ...data, title: e.target.value })}
          placeholder={t("admin.pages.titlePlaceholder")}
          className="h-auto border-0 bg-transparent px-1 py-2 text-3xl font-serif font-medium tracking-tight shadow-none focus-visible:shadow-none"
        />
        <Textarea
          value={data.description}
          onChange={(e) => setData({ ...data, description: e.target.value })}
          placeholder={t("admin.pages.descPlaceholder")}
          rows={2}
          className="border-0 bg-transparent px-1 shadow-none focus-visible:shadow-none"
        />
        <Textarea
          value={data.content}
          onChange={(e) => setData({ ...data, content: e.target.value })}
          rows={26}
          className="font-mono text-sm"
          placeholder={data.contentType === "HTML" ? "<section>...</section>" : "# Hello\n\nMarkdown supported."}
        />
      </div>
      <aside className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="slug">{t("admin.pages.field.slug")}</Label>
          <Input
            id="slug"
            value={data.slug}
            onChange={(e) => setData({ ...data, slug: e.target.value })}
            placeholder={t("admin.pages.field.slugPlaceholder")}
          />
          <p className="text-xs text-[var(--color-foreground-subtle)]">
            {t("admin.pages.field.slugHint", { slug: data.slug || "your-slug" })}
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ct">{t("admin.pages.field.contentType")}</Label>
          <Select
            value={data.contentType}
            onValueChange={(v) => setData({ ...data, contentType: v as "MARKDOWN" | "HTML" })}
          >
            <SelectTrigger id="ct">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MARKDOWN">{t("admin.pages.field.contentType.markdown")}</SelectItem>
              <SelectItem value="HTML">{t("admin.pages.field.contentType.html")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={data.published}
            onChange={(e) => setData({ ...data, published: e.target.checked })}
            className="h-4 w-4 accent-[var(--color-primary)]"
          />
          {t("admin.pages.field.published")}
        </label>
        <div className="flex flex-col gap-2 pt-2">
          <Button onClick={onSave} loading={saving}>
            {t("common.save")}
          </Button>
          {initial.id ? (
            <Button onClick={onDelete} variant="ghost">
              {t("common.delete")}
            </Button>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
