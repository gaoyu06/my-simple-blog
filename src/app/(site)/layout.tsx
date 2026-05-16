import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { PageTransition } from "@/components/page-transition";
import { getSiteMeta, getNavItems, getCustomCss } from "@/server/queries/site";
import { isInitialized } from "@/lib/install-state";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  if (!(await isInitialized())) redirect("/setup");
  const [meta, navItems, customCss] = await Promise.all([
    getSiteMeta(),
    getNavItems(),
    getCustomCss(),
  ]);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader
        siteName={meta.name}
        navItems={navItems.map((n) => ({ label: n.label, href: n.href, external: n.external }))}
      />
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <SiteFooter siteName={meta.name} footerText={meta.footer} />
      {customCss ? <style dangerouslySetInnerHTML={{ __html: customCss }} /> : null}
    </div>
  );
}
