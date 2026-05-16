"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Trash2, AlertOctagon, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useT } from "@/components/i18n-provider";
import { moderateComment, deleteComment } from "@/server/actions/comments";
import type { DictKey } from "@/lib/i18n-dict";

type Status = "PENDING" | "APPROVED" | "SPAM" | "TRASH";

interface Row {
  id: string;
  content: string;
  status: Status;
  createdAtRelative: string;
  authorLabel: string;
  articleSlug: string;
  articleTitle: string;
}

export function CommentsModerator({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const { t } = useT();

  async function update(id: string, status: Status) {
    const result = await moderateComment(id, status);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    router.refresh();
  }

  async function onDelete(id: string) {
    if (!confirm(t("admin.comments.confirmDelete"))) return;
    const result = await deleteComment(id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(t("common.deleted"));
    router.refresh();
  }

  return (
    <ul className="flex flex-col divide-y divide-[var(--color-border)]">
      {rows.map((c) => (
        <li key={c.id} className="flex flex-col gap-2 p-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge
              variant={c.status === "APPROVED" ? "success" : c.status === "PENDING" ? "warning" : "secondary"}
            >
              {t(`status.${c.status}` as DictKey)}
            </Badge>
            <span className="text-[var(--color-foreground)]">{c.authorLabel}</span>
            <span className="text-[var(--color-foreground-subtle)]">{c.createdAtRelative}</span>
            <Link
              href={`/articles/${c.articleSlug}`}
              className="ml-auto text-[var(--color-foreground-muted)] no-underline transition-colors hover:text-[var(--color-foreground)]"
            >
              {t("admin.comments.on", { title: c.articleTitle })}
            </Link>
          </div>
          <p className="whitespace-pre-wrap text-sm text-[var(--color-foreground)]">{c.content}</p>
          <div className="flex items-center gap-1">
            {c.status !== "APPROVED" ? (
              <Button variant="ghost" size="sm" onClick={() => update(c.id, "APPROVED")} leftIcon={<Check className="h-3.5 w-3.5" />}>
                {t("admin.comments.action.approve")}
              </Button>
            ) : null}
            {c.status !== "SPAM" ? (
              <Button variant="ghost" size="sm" onClick={() => update(c.id, "SPAM")} leftIcon={<AlertOctagon className="h-3.5 w-3.5" />}>
                {t("admin.comments.action.spam")}
              </Button>
            ) : null}
            {c.status !== "TRASH" ? (
              <Button variant="ghost" size="sm" onClick={() => update(c.id, "TRASH")} leftIcon={<EyeOff className="h-3.5 w-3.5" />}>
                {t("admin.comments.action.trash")}
              </Button>
            ) : null}
            <Button variant="ghost" size="sm" onClick={() => onDelete(c.id)} leftIcon={<Trash2 className="h-3.5 w-3.5" />}>
              {t("admin.comments.action.delete")}
            </Button>
          </div>
        </li>
      ))}
      {rows.length === 0 ? (
        <li className="py-10 text-center text-sm text-[var(--color-foreground-muted)]">
          {t("admin.comments.empty")}
        </li>
      ) : null}
    </ul>
  );
}
