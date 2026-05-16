import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { TagsAdminTable } from "@/components/admin/tags-admin-table";
import { db } from "@/lib/db";
import { getT } from "@/lib/i18n";

export const metadata = { title: "Tags" };

export default async function TagsAdmin() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/admin");
  const [tags, { t }] = await Promise.all([
    db.tag.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { articles: true } } },
    }),
    getT(),
  ]);
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8">
        <p className="eyebrow mb-1">{t("admin.tags.eyebrow")}</p>
        <h1 className="font-serif text-3xl font-medium tracking-tight">{t("admin.tags.title")}</h1>
        <p className="mt-2 text-sm text-[var(--color-foreground-muted)]">{t("admin.tags.description")}</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <TagsAdminTable
            tags={tags.map((tag) => ({
              id: tag.id,
              name: tag.name,
              slug: tag.slug,
              translations: tag.translations,
              count: tag._count.articles,
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
