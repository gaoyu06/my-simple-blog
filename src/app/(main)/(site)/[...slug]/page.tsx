import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { renderMarkdown, stripLeadingTitle } from "@/lib/markdown";
import { sanitizeRichHtml } from "@/lib/html-sanitize";
import { getPageBySlug } from "@/server/queries/taxonomy";
import { listWorks } from "@/server/queries/works";
import { PageHeading } from "@/components/site/page-heading";
import { WorksGallery } from "@/components/home/works-gallery";
import { decodeParam } from "@/lib/utils";

// Rendered on first request, then cached until content changes.
export function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ slug: string[] }> };

async function loadPage(params: Props["params"]) {
  const page = await getPageBySlug((await params).slug.map(decodeParam).join("/"));
  return page?.published ? page : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await loadPage(params);
  return page ? { title: page.title, description: page.description ?? undefined } : {};
}

export default async function CustomPage({ params }: Props) {
  const page = await loadPage(params);
  if (!page) notFound();
  // The works page keeps its Markdown as the data source but renders as a gallery.
  if (page.slug === "works") {
    const works = await listWorks();
    if (works.length)
      return (
        <div className="mx-auto max-w-5xl px-4 pt-10 sm:px-6 sm:pt-14">
          <PageHeading title={page.title} note={`${works.length} 个`} />
          <WorksGallery works={works} />
        </div>
      );
  }
  const html =
    page.contentType === "MARKDOWN"
      ? await renderMarkdown(stripLeadingTitle(page.content, page.title))
      : sanitizeRichHtml(page.content);

  return (
    <article className="mx-auto max-w-3xl px-4 pt-10 sm:px-6 sm:pt-14">
      <header className="mb-10">
        <h1 className="text-[26px] font-semibold leading-tight sm:text-[32px]">{page.title}</h1>
        {page.description ? <p className="mt-3 text-[var(--color-foreground-muted)]">{page.description}</p> : null}
      </header>
      <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
