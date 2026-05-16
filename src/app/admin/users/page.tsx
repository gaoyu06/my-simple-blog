import { redirect } from "next/navigation";
import { format } from "date-fns";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { UsersAdminTable } from "@/components/admin/users-admin-table";
import { getT } from "@/lib/i18n";

export const metadata = { title: "Users" };

export default async function UsersAdmin() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/admin");
  const [users, { t }] = await Promise.all([
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        role: true,
        status: true,
        createdAt: true,
        _count: { select: { articles: true, comments: true } },
      },
    }),
    getT(),
  ]);
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <p className="eyebrow mb-1">{t("admin.users.eyebrow")}</p>
        <h1 className="font-serif text-3xl font-medium tracking-tight">{t("admin.users.title")}</h1>
      </div>
      <Card className="overflow-hidden">
        <UsersAdminTable
          currentUserId={session!.user.id}
          users={users.map((u) => ({
            id: u.id,
            email: u.email,
            name: u.name,
            username: u.username,
            role: u.role,
            status: u.status,
            createdAt: format(u.createdAt, "yyyy.MM.dd"),
            articleCount: u._count.articles,
            commentCount: u._count.comments,
          }))}
        />
      </Card>
    </div>
  );
}
