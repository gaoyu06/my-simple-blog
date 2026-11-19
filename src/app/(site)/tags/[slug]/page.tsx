import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ArticleList } from "@/components/site/article-list";
import { PageHeading } from "@/components/site/page-heading";
import { getTagBySlug } from "@/server/queries/taxonomy";
import { listArticlesByTag } from "@/server/queries/articles";
import { localizedName } from "@/lib/taxonomy-i18n";
import { decodeParam } from "@/lib/utils";

// Rendered on first request, then cached until content changes.
export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tag = await getTagBySlug(decodeParam((await params).slug));
  return tag ? { title: `标签：${localizedName(tag, "zh")}` } : {};
}

export default async function TagPage({ params }: Props) {
  const slug = decodeParam((await params).slug);
  const tag = await getTagBySlug(slug);
  if (!tag) notFound();
  const articles = await listArticlesByTag(slug);
  return (
    <div className="mx-auto max-w-3xl px-4 pt-10 sm:px-6 sm:pt-14">
      <PageHeading title={`# ${localizedName(tag, "zh")}`} note={`${articles.length} 篇`} />
      <ArticleList articles={articles} />
    </div>
  );
}
