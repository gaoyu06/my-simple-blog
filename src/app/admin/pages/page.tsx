import Link from "next/link";
import { format } from "date-fns";
import { Plus } from "lucide-react";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getT } from "@/lib/i18n";

export const metadata = { title: "Pages" };

export default async function PagesAdmin() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/admin");
  const [pages, { t }] = await Promise.all([
    db.page.findMany({ orderBy: { updatedAt: "desc" } }),
    getT(),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="eyebrow mb-1">{t("admin.pages.eyebrow")}</p>
          <h1 className="font-serif text-3xl font-medium tracking-tight">{t("admin.pages.title")}</h1>
        </div>
        <Button asChild leftIcon={<Plus className="h-4 w-4" />}>
          <Link href="/admin/pages/new">{t("admin.pages.new")}</Link>
        </Button>
      </div>
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-surface)] text-left">
            <tr className="border-b border-[var(--color-border)]">
              <th className="px-4 py-3 font-medium text-[var(--color-foreground-muted)]">{t("admin.pages.table.title")}</th>
              <th className="px-4 py-3 font-medium text-[var(--color-foreground-muted)]">{t("admin.pages.table.route")}</th>
              <th className="px-4 py-3 font-medium text-[var(--color-foreground-muted)]">{t("admin.pages.table.type")}</th>
              <th className="px-4 py-3 font-medium text-[var(--color-foreground-muted)]">{t("admin.pages.table.status")}</th>
              <th className="px-4 py-3 text-right font-medium text-[var(--color-foreground-muted)]">{t("admin.pages.table.updated")}</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.id} className="group border-b border-[var(--color-border)] last:border-0 transition-colors hover:bg-[var(--color-surface)]">
                <td className="px-4 py-3">
                  <Link href={`/admin/pages/${p.id}/edit`} className="font-medium text-[var(--color-foreground)] no-underline transition-colors group-hover:text-[var(--color-primary)]">
                    {p.title}
                  </Link>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-[var(--color-foreground-muted)]">/{p.slug}</td>
                <td className="px-4 py-3">
                  <Badge variant="secondary">{p.contentType}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={p.published ? "success" : "warning"}>
                    {p.published ? t("admin.pages.published") : t("admin.pages.hidden")}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right font-mono text-xs uppercase tabular-nums tracking-wider text-[var(--color-foreground-subtle)]">
                  {format(p.updatedAt, "yyyy.MM.dd")}
                </td>
              </tr>
            ))}
            {pages.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-[var(--color-foreground-muted)]">
                  {t("admin.pages.empty")}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
