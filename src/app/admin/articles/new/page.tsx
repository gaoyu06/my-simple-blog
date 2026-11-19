import { db } from "@/lib/db";
import { ArticleForm } from "@/components/editor/article-form";

export const metadata = { title: "写文章" };

export default async function NewArticlePage() {
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true, translations: true },
  });

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
        featured: false,
        allowComment: true,
      }}
      categories={categories}
    />
  );
}
