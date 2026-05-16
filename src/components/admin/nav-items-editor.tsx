"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, ArrowUp, ArrowDown, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { useT } from "@/components/i18n-provider";
import { saveNavItem, deleteNavItem, reorderNavItems } from "@/server/actions/navigation";

interface Item {
  id: string;
  label: string;
  href: string;
  position: number;
  external: boolean;
}

export function NavItemsEditor({ items: initial }: { items: Item[] }) {
  const router = useRouter();
  const { t } = useT();
  const [items, setItems] = React.useState(initial);
  const [editing, setEditing] = React.useState<Item | null>(null);
  const [adding, setAdding] = React.useState(false);

  React.useEffect(() => {
    setItems(initial);
  }, [initial]);

  async function move(idx: number, dir: -1 | 1) {
    const next = [...items];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setItems(next);
    const result = await reorderNavItems(next.map((n) => n.id));
    if (!result.ok) toast.error(result.error);
    router.refresh();
  }

  async function onDelete(id: string) {
    if (!confirm(t("admin.navigation.confirmDelete"))) return;
    const result = await deleteNavItem(id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(t("common.deleted"));
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col divide-y divide-[var(--color-border)]">
        {items.map((item, idx) => (
          <li key={item.id} className="flex items-center gap-3 py-3">
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={() => move(idx, -1)}
                disabled={idx === 0}
                className="rounded text-[var(--color-foreground-subtle)] transition-colors hover:text-[var(--color-foreground)] disabled:opacity-30"
                aria-label="↑"
              >
                <ArrowUp className="h-3 w-3" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => move(idx, 1)}
                disabled={idx === items.length - 1}
                className="rounded text-[var(--color-foreground-subtle)] transition-colors hover:text-[var(--color-foreground)] disabled:opacity-30"
                aria-label="↓"
              >
                <ArrowDown className="h-3 w-3" aria-hidden />
              </button>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-[var(--color-foreground)]">{item.label}</p>
              <p className="truncate font-mono text-xs text-[var(--color-foreground-subtle)]">
                {item.href} {item.external ? "↗" : ""}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setEditing(item)} aria-label={t("common.edit")}>
              <Pencil className="h-4 w-4" aria-hidden />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)} aria-label={t("common.delete")}>
              <Trash2 className="h-4 w-4" aria-hidden />
            </Button>
          </li>
        ))}
        {items.length === 0 ? (
          <li className="py-6 text-center text-sm text-[var(--color-foreground-muted)]">
            {t("admin.navigation.empty")}
          </li>
        ) : null}
      </ul>
      <Button onClick={() => setAdding(true)} leftIcon={<Plus className="h-4 w-4" />} variant="outline" className="self-start">
        {t("admin.navigation.add")}
      </Button>
      <NavItemDialog
        open={adding || !!editing}
        initial={editing}
        onClose={() => {
          setEditing(null);
          setAdding(false);
        }}
        onSaved={() => {
          setEditing(null);
          setAdding(false);
          router.refresh();
        }}
      />
    </div>
  );
}

function NavItemDialog({
  open,
  initial,
  onClose,
  onSaved,
}: {
  open: boolean;
  initial: Item | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useT();
  const [label, setLabel] = React.useState("");
  const [href, setHref] = React.useState("");
  const [external, setExternal] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setLabel(initial?.label ?? "");
      setHref(initial?.href ?? "");
      setExternal(initial?.external ?? false);
    }
  }, [open, initial]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const result = await saveNavItem({
      id: initial?.id,
      label,
      href,
      external,
      position: initial?.position ?? 0,
    });
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
          <DialogTitle>
            {initial ? t("admin.navigation.dialog.titleEdit") : t("admin.navigation.dialog.titleNew")}
          </DialogTitle>
          <DialogDescription>{t("admin.navigation.dialog.desc")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nav-label">{t("admin.navigation.field.label")}</Label>
            <Input id="nav-label" value={label} onChange={(e) => setLabel(e.target.value)} required autoFocus />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nav-href">{t("admin.navigation.field.url")}</Label>
            <Input
              id="nav-href"
              value={href}
              onChange={(e) => setHref(e.target.value)}
              placeholder="/about or https://example.com"
              required
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={external}
              onChange={(e) => setExternal(e.target.checked)}
              className="h-4 w-4 accent-[var(--color-primary)]"
            />
            {t("admin.navigation.field.external")}
          </label>
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
