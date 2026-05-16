"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { useT, LOCALES, LOCALE_LABELS, type Locale } from "@/components/i18n-provider";
import { parseTranslations, type TaxonomyTranslationMap, localizedName } from "@/lib/taxonomy-i18n";
import { updateTag, deleteTag } from "@/server/actions/taxonomy";

interface Tag {
  id: string;
  name: string;
  slug: string;
  translations: string | null;
  count: number;
}

export function TagsAdminTable({ tags }: { tags: Tag[] }) {
  const router = useRouter();
  const { t, locale } = useT();
  const [editing, setEditing] = React.useState<Tag | null>(null);

  async function onDelete(id: string) {
    if (!confirm(t("admin.tags.confirmDelete"))) return;
    const result = await deleteTag(id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(t("common.deleted"));
    router.refresh();
  }

  return (
    <>
      <ul className="flex flex-col divide-y divide-[var(--color-border)]">
        {tags.map((tag) => {
          const display = localizedName(tag, locale);
          return (
            <li key={tag.id} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[var(--color-foreground)]">#{display}</span>
                  <Badge variant="secondary">{tag.count}</Badge>
                </div>
                <p className="font-mono text-xs text-[var(--color-foreground-subtle)]">{tag.slug}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setEditing(tag)} aria-label={t("common.edit")}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(tag.id)} aria-label={t("common.delete")}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          );
        })}
        {tags.length === 0 ? (
          <li className="py-6 text-center text-sm text-[var(--color-foreground-muted)]">
            {t("admin.tags.empty")}
          </li>
        ) : null}
      </ul>
      <TagDialog
        initial={editing}
        open={!!editing}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          router.refresh();
        }}
      />
    </>
  );
}

function TagDialog({
  open,
  initial,
  onClose,
  onSaved,
}: {
  open: boolean;
  initial: Tag | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useT();
  const [name, setName] = React.useState("");
  const [translations, setTranslations] = React.useState<TaxonomyTranslationMap>({});
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open && initial) {
      setName(initial.name);
      setTranslations(parseTranslations(initial.translations));
    }
  }, [open, initial]);

  function updateLocaleName(loc: Locale, v: string) {
    setTranslations((prev) => ({ ...prev, [loc]: { ...(prev[loc] ?? {}), name: v } }));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!initial) return;
    setSaving(true);
    const result = await updateTag({ id: initial.id, name, translations });
    setSaving(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(t("common.saved"));
    onSaved();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? onClose() : undefined)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("admin.tags.dialog.title")}</DialogTitle>
          <DialogDescription>{t("admin.tags.dialog.desc")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tag-name">{t("admin.tags.field.name")}</Label>
            <Input id="tag-name" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
            <p className="text-xs text-[var(--color-foreground-subtle)]">{t("admin.tags.field.nameHint")}</p>
          </div>
          <div className="flex flex-col gap-2 border-t border-[var(--color-border)] pt-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--color-foreground-muted)]">
              {t("taxonomy.localized")}
            </p>
            <Tabs defaultValue={LOCALES[0]}>
              <TabsList>
                {LOCALES.map((loc) => (
                  <TabsTrigger key={loc} value={loc}>
                    {LOCALE_LABELS[loc]}
                  </TabsTrigger>
                ))}
              </TabsList>
              {LOCALES.map((loc) => (
                <TabsContent key={loc} value={loc} className="flex flex-col gap-2">
                  <Label htmlFor={`tag-name-${loc}`}>{t("taxonomy.nameForLocale")}</Label>
                  <Input
                    id={`tag-name-${loc}`}
                    value={translations[loc]?.name ?? ""}
                    onChange={(e) => updateLocaleName(loc, e.target.value)}
                    placeholder={name || "—"}
                  />
                </TabsContent>
              ))}
            </Tabs>
            <p className="text-xs text-[var(--color-foreground-subtle)]">{t("taxonomy.localizedHint")}</p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                {t("common.cancel")}
              </Button>
            </DialogClose>
            <Button type="submit" loading={saving}>
              {t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
