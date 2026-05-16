"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useT } from "@/components/i18n-provider";
import { deleteProvider } from "@/server/actions/ai-providers";

interface Row {
  id: string;
  name: string;
  kind: "LLM" | "IMAGE";
  baseUrl: string;
  model: string;
  isDefault: boolean;
  enabled: boolean;
}

export function AIProvidersTable({ providers }: { providers: Row[] }) {
  const router = useRouter();
  const { t } = useT();
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  async function onDelete(id: string) {
    if (!confirm(t("admin.ai.confirmDelete"))) return;
    setPendingId(id);
    const result = await deleteProvider(id);
    setPendingId(null);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(t("common.deleted"));
    router.refresh();
  }

  if (providers.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-[var(--color-foreground-muted)]">
        {t("admin.ai.empty")}
      </p>
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-[var(--color-border)]">
      {providers.map((p) => (
        <li key={p.id} className="flex items-center justify-between gap-3 py-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-[var(--color-foreground)]">{p.name}</span>
              <Badge variant={p.kind === "LLM" ? "default" : "secondary"}>{p.kind}</Badge>
              {p.isDefault ? <Badge variant="outline">{t("admin.ai.badge.default")}</Badge> : null}
              {!p.enabled ? <Badge variant="warning">{t("admin.ai.badge.disabled")}</Badge> : null}
            </div>
            <p className="mt-0.5 truncate font-mono text-xs text-[var(--color-foreground-subtle)]">
              {p.model} · {p.baseUrl || "—"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("admin.ai.deleteAria")}
            onClick={() => onDelete(p.id)}
            loading={pendingId === p.id}
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </Button>
        </li>
      ))}
    </ul>
  );
}
