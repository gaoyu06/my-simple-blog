import Link from "next/link";
import { FileText, MessageSquare, Users as UsersIcon, FolderTree } from "lucide-react";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getT } from "@/lib/i18n";

export const metadata = { title: "Dashboard" };

async function getStats(authorId: string, isAdmin: boolean) {
  const where = isAdmin ? {} : { authorId };
  const [total, drafts, published, comments, users, categories] = await Promise.all([
    db.article.count({ where }),
    db.article.count({ where: { ...where, status: "DRAFT" } }),
    db.article.count({ where: { ...where, status: "PUBLISHED" } }),
    db.comment.count(),
    db.user.count(),
    db.category.count(),
  ]);
  return { total, drafts, published, comments, users, categories };
}

export default async function DashboardPage() {
  const session = await auth();
  const isAdmin = session!.user.role === "ADMIN";
  const [stats, { t }] = await Promise.all([getStats(session!.user.id, isAdmin), getT()]);

  const cards = [
    {
      label: t("admin.dashboard.cards.articles"),
      value: stats.total,
      sub: t("admin.dashboard.cards.articlesSub", { published: stats.published, drafts: stats.drafts }),
      icon: FileText,
      href: "/admin/articles",
    },
    {
      label: t("admin.dashboard.cards.comments"),
      value: stats.comments,
      sub: t("admin.dashboard.cards.commentsSub"),
      icon: MessageSquare,
      href: "/admin/comments",
    },
    {
      label: t("admin.dashboard.cards.categories"),
      value: stats.categories,
      sub: t("admin.dashboard.cards.categoriesSub"),
      icon: FolderTree,
      href: "/admin/categories",
    },
    {
      label: t("admin.dashboard.cards.users"),
      value: stats.users,
      sub: t("admin.dashboard.cards.usersSub"),
      icon: UsersIcon,
      href: "/admin/users",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-1">{t("admin.dashboard.eyebrow")}</p>
          <h1 className="font-serif text-3xl font-medium tracking-tight">
            {t("admin.dashboard.welcome", { name: session!.user.name ?? t("admin.dashboard.writer") })}
          </h1>
        </div>
        <Button asChild>
          <Link href="/admin/articles/new">{t("admin.dashboard.newArticle")}</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, idx) => (
          <Link key={c.label} href={c.href} className={`rise rise-${Math.min(idx + 1, 6)} no-underline`}>
            <Card className="h-full">
              <CardHeader className="flex-row items-start justify-between space-y-0 pb-2">
                <CardDescription className="uppercase tracking-wider text-[10px]">
                  {c.label}
                </CardDescription>
                <c.icon className="h-4 w-4 text-[var(--color-foreground-subtle)]" aria-hidden />
              </CardHeader>
              <CardContent>
                <p className="font-serif text-3xl font-medium tabular-nums">{c.value}</p>
                <p className="mt-1 text-xs text-[var(--color-foreground-muted)]">{c.sub}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
