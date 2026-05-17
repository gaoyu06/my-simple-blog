import { redirect } from "next/navigation";
import { SetupWizard } from "@/components/setup/setup-wizard";
import { isInitialized } from "@/lib/install-state";
import { detectDbKind, redactedDbUrl, DB_KIND_LABEL } from "@/lib/db-info";
import { DEFAULT_LOCALE } from "@/lib/i18n";
import { db } from "@/lib/db";

export default async function SetupPage() {
  if (await isInitialized()) redirect("/");

  const adminCount = await db.user
    .count({ where: { role: "ADMIN" } })
    .catch(() => 0);
  const kind = detectDbKind();

  return (
    <SetupWizard
      needsAdmin={adminCount === 0}
      defaultLocale={DEFAULT_LOCALE}
      db={{ label: DB_KIND_LABEL[kind], url: redactedDbUrl() }}
    />
  );
}
