import { db } from "@/lib/db";
import { ArticleForm } from "@/components/editor/article-form";

export const metadata = { title: "New article" };

export default async function NewArticlePage() {
  const [categories, coverStyles] = await Promise.all([
    db.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, translations: true },
    }),
    db.coverStyle.findMany({ orderBy: { createdAt: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <ArticleForm
      initial={{
        title: "",
        slug: "",
        summary: "",
        contentMd: "",
        status: "DRAFT",
        categoryId: null,
        tags: [],
        coverImage: null,
        coverStyleId: null,
        featured: false,
        allowComment: true,
      }}
      categories={categories}
      coverStyles={coverStyles}
    />
  );
}
