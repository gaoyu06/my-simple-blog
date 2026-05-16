"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useT } from "@/components/i18n-provider";
import { updateUser, deleteUser } from "@/server/actions/users";

type Role = "ADMIN" | "AUTHOR" | "GUEST";
type Status = "PENDING" | "ACTIVE" | "BANNED";

interface Row {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  role: Role;
  status: Status;
  createdAt: string;
  articleCount: number;
  commentCount: number;
}

const ROLES: Role[] = ["ADMIN", "AUTHOR", "GUEST"];
const STATUSES: Status[] = ["ACTIVE", "PENDING", "BANNED"];

export function UsersAdminTable({ users, currentUserId }: { users: Row[]; currentUserId: string }) {
  const router = useRouter();
  const { t } = useT();

  async function onChange(id: string, patch: { role?: Role; status?: Status }) {
    const result = await updateUser({ id, ...patch });
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    router.refresh();
  }

  async function onDelete(id: string) {
    if (!confirm(t("admin.users.confirmDelete"))) return;
    const result = await deleteUser(id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(t("common.deleted"));
    router.refresh();
  }

  return (
    <table className="w-full text-sm">
      <thead className="bg-[var(--color-surface)] text-left">
        <tr className="border-b border-[var(--color-border)]">
          <th className="px-4 py-3 font-medium text-[var(--color-foreground-muted)]">{t("admin.users.table.user")}</th>
          <th className="px-4 py-3 font-medium text-[var(--color-foreground-muted)]">{t("admin.users.table.role")}</th>
          <th className="px-4 py-3 font-medium text-[var(--color-foreground-muted)]">{t("admin.users.table.status")}</th>
          <th className="px-4 py-3 text-right font-medium text-[var(--color-foreground-muted)]">{t("admin.users.table.articles")}</th>
          <th className="px-4 py-3 text-right font-medium text-[var(--color-foreground-muted)]">{t("admin.users.table.comments")}</th>
          <th className="px-4 py-3 text-right font-medium text-[var(--color-foreground-muted)]">{t("admin.users.table.joined")}</th>
          <th className="px-4 py-3" />
        </tr>
      </thead>
      <tbody>
        {users.map((u) => (
          <tr key={u.id} className="border-b border-[var(--color-border)] last:border-0">
            <td className="px-4 py-3">
              <p className="font-medium text-[var(--color-foreground)]">{u.name ?? u.username ?? "—"}</p>
              <p className="font-mono text-xs text-[var(--color-foreground-subtle)]">{u.email}</p>
            </td>
            <td className="px-4 py-3">
              <Select
                value={u.role}
                onValueChange={(v) => onChange(u.id, { role: v as Role })}
                disabled={u.id === currentUserId}
              >
                <SelectTrigger className="h-8 w-[110px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {t(`role.${r}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </td>
            <td className="px-4 py-3">
              <Select
                value={u.status}
                onValueChange={(v) => onChange(u.id, { status: v as Status })}
              >
                <SelectTrigger className="h-8 w-[110px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {t(`status.${s}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </td>
            <td className="px-4 py-3 text-right tabular-nums">{u.articleCount}</td>
            <td className="px-4 py-3 text-right tabular-nums">{u.commentCount}</td>
            <td className="px-4 py-3 text-right font-mono text-xs uppercase tabular-nums tracking-wider text-[var(--color-foreground-subtle)]">
              {u.createdAt}
            </td>
            <td className="px-4 py-3 text-right">
              {u.id !== currentUserId ? (
                <Button variant="ghost" size="icon" onClick={() => onDelete(u.id)} aria-label={t("admin.users.deleteAria")}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              ) : (
                <Badge variant="outline">{t("admin.users.you")}</Badge>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
