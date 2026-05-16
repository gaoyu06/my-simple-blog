import Link from "next/link";
import { format } from "date-fns";
import { Plus } from "lucide-react";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getT } from "@/lib/i18n";
import { localizedName } from "@/lib/taxonomy-i18n";
import type { DictKey } from "@/lib/i18n-dict";

export const metadata = { title: "Articles" };

export default async function AdminArticlesPage() {
  const session = await auth();
  const role = session!.user.role;
  const where = role === "ADMIN" ? {} : { authorId: session!.user.id };
  const [articles, { t, locale }] = await Promise.all([
    db.article.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        author: { select: { name: true, username: true } },
        category: { select: { name: true, translations: true } },
        _count: { select: { comments: true } },
      },
    }),
    getT(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="eyebrow mb-1">{t("admin.articles.eyebrow")}</p>
          <h1 className="font-serif text-3xl font-medium tracking-tight">{t("admin.articles.title")}</h1>
          <p className="mt-2 text-sm text-[var(--color-foreground-muted)]">
            {articles.length === 1
              ? t("admin.articles.countOne")
              : t("admin.articles.count", { count: articles.length })}
          </p>
        </div>
        <Button asChild leftIcon={<Plus className="h-4 w-4" />}>
          <Link href="/admin/articles/new">{t("admin.articles.new")}</Link>
        </Button>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[var(--color-surface)] text-left">
            <tr className="border-b border-[var(--color-border)]">
              <th className="px-4 py-3 font-medium text-[var(--color-foreground-muted)]">{t("admin.articles.table.title")}</th>
              <th className="px-4 py-3 font-medium text-[var(--color-foreground-muted)]">{t("admin.articles.table.status")}</th>
              <th className="px-4 py-3 font-medium text-[var(--color-foreground-muted)]">{t("admin.articles.table.category")}</th>
              {role === "ADMIN" ? (
                <th className="px-4 py-3 font-medium text-[var(--color-foreground-muted)]">{t("admin.articles.table.author")}</th>
              ) : null}
              <th className="px-4 py-3 text-right font-medium text-[var(--color-foreground-muted)]">{t("admin.articles.table.views")}</th>
              <th className="px-4 py-3 text-right font-medium text-[var(--color-foreground-muted)]">{t("admin.articles.table.updated")}</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((a) => (
              <tr
                key={a.id}
                className="group border-b border-[var(--color-border)] last:border-0 transition-colors hover:bg-[var(--color-surface)]"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/articles/${a.id}/edit`}
                    className="font-medium text-[var(--color-foreground)] no-underline transition-colors group-hover:text-[var(--color-primary)]"
                  >
                    {a.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-[var(--color-foreground-subtle)]">/{a.slug}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={
                      a.status === "PUBLISHED" ? "success" : a.status === "ARCHIVED" ? "secondary" : "warning"
                    }
                  >
                    {t(`status.${a.status}` as DictKey)}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-[var(--color-foreground-muted)]">
                  {a.category ? localizedName(a.category, locale) : "—"}
                </td>
                {role === "ADMIN" ? (
                  <td className="px-4 py-3 text-[var(--color-foreground-muted)]">
                    {a.author.name ?? a.author.username ?? "—"}
                  </td>
                ) : null}
                <td className="px-4 py-3 text-right tabular-nums text-[var(--color-foreground-muted)]">{a.viewCount}</td>
                <td className="px-4 py-3 text-right font-mono text-xs uppercase tabular-nums tracking-wider text-[var(--color-foreground-subtle)]">
                  {format(a.updatedAt, "yyyy.MM.dd")}
                </td>
              </tr>
            ))}
            {articles.length === 0 ? (
              <tr>
                <td colSpan={role === "ADMIN" ? 6 : 5} className="px-4 py-10 text-center text-[var(--color-foreground-muted)]">
                  {t("admin.articles.empty.text")}{" "}
                  <Link href="/admin/articles/new" className="text-[var(--color-foreground)]">
                    {t("admin.articles.empty.cta")}
                  </Link>
                  .
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
