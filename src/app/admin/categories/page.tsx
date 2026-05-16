import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { listCategoriesWithCounts } from "@/server/queries/taxonomy";
import { CategoriesEditor } from "@/components/admin/categories-editor";
import { getT } from "@/lib/i18n";

export const metadata = { title: "Categories" };

export default async function CategoriesAdmin() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/admin");
  const [categories, { t }] = await Promise.all([listCategoriesWithCounts(), getT()]);
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8">
        <p className="eyebrow mb-1">{t("admin.categories.eyebrow")}</p>
        <h1 className="font-serif text-3xl font-medium tracking-tight">{t("admin.categories.title")}</h1>
      </div>
      <Card>
        <CardContent className="pt-6">
          <CategoriesEditor
            categories={categories.map((c) => ({
              id: c.id,
              name: c.name,
              slug: c.slug,
              description: c.description,
              translations: c.translations,
              articleCount: c.articleCount,
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
