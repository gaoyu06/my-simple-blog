import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { db } from "@/lib/db";
import { renderMarkdown, stripLeadingTitle } from "@/lib/markdown";
import { sanitizeRichHtml } from "@/lib/html-sanitize";
import { getT } from "@/lib/i18n";

async function loadPage(slugPath: string[]) {
  const slug = slugPath.join("/");
  return db.page.findUnique({ where: { slug } });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await loadPage(slug);
  if (!page) return {};
  return { title: page.title, description: page.description ?? undefined };
}

export default async function CustomPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const page = await loadPage(slug);
  if (!page || !page.published) notFound();

  const cleanedContent =
    page.contentType === "MARKDOWN" ? stripLeadingTitle(page.content, page.title) : page.content;
  const [html, { t }] = await Promise.all([
    page.contentType === "MARKDOWN" ? renderMarkdown(cleanedContent) : Promise.resolve(sanitizeRichHtml(cleanedContent)),
    getT(),
  ]);

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <header className="mb-10">
        <p className="eyebrow mb-2">{t("page.eyebrow")}</p>
        <h1 className="font-serif text-4xl font-medium tracking-tight">{page.title}</h1>
        {page.description ? (
          <p className="mt-3 text-base text-[var(--color-foreground-muted)]">{page.description}</p>
        ) : null}
      </header>
      <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
