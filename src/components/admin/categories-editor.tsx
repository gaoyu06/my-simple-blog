"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { saveCategory, deleteCategory } from "@/server/actions/taxonomy";

interface Cat {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  articleCount: number;
}

export function CategoriesEditor({ categories }: { categories: Cat[] }) {
  const router = useRouter();
  const [editing, setEditing] = React.useState<Cat | null>(null);
  const [adding, setAdding] = React.useState(false);

  async function onDelete(id: string) {
    if (!confirm("Delete this category? Articles will become uncategorized.")) return;
    const result = await deleteCategory(id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Deleted.");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col divide-y divide-[var(--color-border)]">
        {categories.map((c) => (
          <li key={c.id} className="flex items-center gap-3 py-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-[var(--color-foreground)]">{c.name}</span>
                <Badge variant="secondary">{c.articleCount}</Badge>
              </div>
              <p className="font-mono text-xs text-[var(--color-foreground-subtle)]">/{c.slug}</p>
              {c.description ? (
                <p className="mt-0.5 truncate text-xs text-[var(--color-foreground-muted)]">{c.description}</p>
              ) : null}
            </div>
            <Button variant="ghost" size="icon" onClick={() => setEditing(c)} aria-label="Edit">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(c.id)} aria-label="Delete">
              <Trash2 className="h-4 w-4" />
            </Button>
          </li>
        ))}
        {categories.length === 0 ? (
          <li className="py-6 text-center text-sm text-[var(--color-foreground-muted)]">No categories yet.</li>
        ) : null}
      </ul>
      <Button
        onClick={() => setAdding(true)}
        variant="outline"
        leftIcon={<Plus className="h-4 w-4" />}
        className="self-start"
      >
        Add category
      </Button>

      <CategoryDialog
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

function CategoryDialog({
  open,
  initial,
  onClose,
  onSaved,
}: {
  open: boolean;
  initial: Cat | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setName(initial?.name ?? "");
      setSlug(initial?.slug ?? "");
      setDescription(initial?.description ?? "");
    }
  }, [open, initial]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const result = await saveCategory({
      id: initial?.id,
      name,
      slug: slug || undefined,
      description: description || null,
    });
    setSaving(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("Saved.");
    onSaved();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? onClose() : undefined)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "Edit category" : "New category"}</DialogTitle>
          <DialogDescription>
            Categories are mutually exclusive (one per article). Tags are for cross-cutting topics.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cat-name">Name</Label>
            <Input id="cat-name" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cat-slug">Slug</Label>
            <Input
              id="cat-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="auto-generated from name"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cat-desc">Description</Label>
            <Textarea
              id="cat-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" loading={saving}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
