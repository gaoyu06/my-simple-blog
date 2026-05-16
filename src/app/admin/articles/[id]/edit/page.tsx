import { notFound, redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { canEditArticle } from "@/lib/permissions";
import { ArticleForm } from "@/components/editor/article-form";

export const metadata = { title: "Edit article" };

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  const [article, categories, coverStyles] = await Promise.all([
    db.article.findUnique({
      where: { id },
      include: { tags: { include: { tag: true } } },
    }),
    db.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, translations: true },
    }),
    db.coverStyle.findMany({ orderBy: { createdAt: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!article) notFound();
  if (!canEditArticle(session, article)) redirect("/admin/articles");

  return (
    <ArticleForm
      initial={{
        id: article.id,
        title: article.title,
        slug: article.slug,
        summary: article.summary ?? "",
        contentMd: article.contentMd,
        status: article.status,
        categoryId: article.categoryId,
        tags: article.tags.map((t) => t.tag.name),
        coverImage: article.coverImage,
        coverStyleId: article.coverStyleId,
        featured: article.featured,
        allowComment: article.allowComment,
      }}
      categories={categories}
      coverStyles={coverStyles}
    />
  );
}
