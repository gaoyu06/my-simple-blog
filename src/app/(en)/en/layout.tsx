import type { Metadata } from "next";

import { RootHtml } from "@/components/root-html";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { getSiteMeta } from "@/server/queries/site";

export const revalidate = 60;

const FULL_NAME = "Yu Gao";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL ?? "http://localhost:3000"),
  title: { default: FULL_NAME, template: `%s - ${FULL_NAME}` },
  description: "Independent developer building AI agents, LLM integrations and full-stack apps.",
};

const NAV = [
  { label: "Home", href: "/en" },
  { label: "Works", href: "/en/works" },
  { label: "About", href: "/en/about" },
  { label: "Blog (Chinese)", href: "/archive" },
];

export default async function EnglishLayout({ children }: { children: React.ReactNode }) {
  const meta = await getSiteMeta();
  return (
    <RootHtml lang="en">
      <div className="flex min-h-dvh flex-col">
        <SiteHeader siteName={meta.name} navItems={NAV} lang="en" />
        <main className="flex-1">{children}</main>
        <SiteFooter siteName={FULL_NAME} footerText="" rss={false} />
      </div>
    </RootHtml>
  );
}
