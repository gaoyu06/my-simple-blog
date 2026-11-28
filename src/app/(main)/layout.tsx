import type { Metadata } from "next";

import { RootHtml } from "@/components/root-html";
import { getSiteMeta } from "@/server/queries/site";

export async function generateMetadata(): Promise<Metadata> {
  const meta = await getSiteMeta();
  return {
    metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
    title: { default: meta.name, template: `%s - ${meta.name}` },
    description: meta.description || undefined,
    keywords: meta.keywords.length ? meta.keywords : undefined,
    alternates: { types: { "application/rss+xml": "/rss.xml" } },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <RootHtml lang="zh-CN">{children}</RootHtml>;
}
