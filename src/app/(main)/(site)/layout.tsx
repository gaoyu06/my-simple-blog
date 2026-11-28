import { redirect } from "next/navigation";

import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { getSiteMeta, getNavItems, getCustomCss, listEnglishSlugs } from "@/server/queries/site";
import { isInitialized } from "@/lib/install-state";

// Public pages are served from the ISR cache and refreshed whenever content
// changes (every admin action calls revalidatePath("/", "layout")). The
// 60-second window covers changes made outside the admin, such as direct
// database writes and view counts. Regeneration runs in the background after
// a stale hit, so a short window does not slow down page loads.
export const revalidate = 60;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  if (!(await isInitialized())) redirect("/setup");
  const [meta, navItems, customCss, enSlugs] = await Promise.all([
    getSiteMeta(),
    getNavItems(),
    getCustomCss(),
    listEnglishSlugs(),
  ]);

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader
        siteName={meta.name}
        enSlugs={enSlugs}
        navItems={navItems.map((n) => ({ label: n.label, href: n.href, external: n.external }))}
      />
      <main className="flex-1">{children}</main>
      <SiteFooter siteName={meta.name} footerText={meta.footer} />
      {customCss ? <style dangerouslySetInnerHTML={{ __html: customCss }} /> : null}
    </div>
  );
}
