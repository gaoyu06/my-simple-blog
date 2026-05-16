import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { AddAIProviderDialog } from "@/components/admin/ai-provider-dialog";
import { AIProvidersTable } from "@/components/admin/ai-providers-table";
import { getT } from "@/lib/i18n";

export const metadata = { title: "AI Providers" };

export default async function AIAdminPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/admin");

  const [providers, { t }] = await Promise.all([
    db.aIProvider.findMany({
      orderBy: [{ kind: "asc" }, { isDefault: "desc" }, { updatedAt: "desc" }],
    }),
    getT(),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-1">{t("admin.ai.eyebrow")}</p>
          <h1 className="font-serif text-3xl font-medium tracking-tight">{t("admin.ai.title")}</h1>
          <p className="mt-2 max-w-prose text-sm text-[var(--color-foreground-muted)]">
            Configure any OpenAI-compatible provider for LLM (chat, summary, grammar check) and image generation.
            Mark one provider as default per kind — it&rsquo;s used when nothing else is specified.
          </p>
        </div>
        <AddAIProviderDialog />
      </div>

      <Card>
        <CardContent className="p-0">
          <AIProvidersTable
            providers={providers.map((p) => ({
              id: p.id,
              name: p.name,
              kind: p.kind,
              baseUrl: p.baseUrl,
              model: p.model,
              isDefault: p.isDefault,
              enabled: p.enabled,
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
