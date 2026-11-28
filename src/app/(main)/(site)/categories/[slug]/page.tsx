import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ArticleList } from "@/components/site/article-list";
import { PageHeading } from "@/components/site/page-heading";
import { getCategoryBySlug } from "@/server/queries/taxonomy";
import { listArticlesByCategory } from "@/server/queries/articles";
import { localizedName } from "@/lib/taxonomy-i18n";
import { decodeParam } from "@/lib/utils";

// Rendered on first request, then cached until content changes.
export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await getCategoryBySlug(decodeParam((await params).slug));
  return category ? { title: localizedName(category, "zh") } : {};
}

export default async function CategoryPage({ params }: Props) {
  const slug = decodeParam((await params).slug);
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();
  const articles = await listArticlesByCategory(slug);
  return (
    <div className="mx-auto max-w-3xl px-4 pt-10 sm:px-6 sm:pt-14">
      <PageHeading title={localizedName(category, "zh")} note={`${articles.length} 篇`} />
      <ArticleList articles={articles} />
    </div>
  );
}
