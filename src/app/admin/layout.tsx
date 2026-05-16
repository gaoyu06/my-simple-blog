import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ColorThemeSwitcher } from "@/components/ui/color-theme-switcher";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { Separator } from "@/components/ui/separator";
import { AccountMenu } from "@/components/site/account-menu";
import { PageTransition } from "@/components/page-transition";
import {
  AdminNav,
  type AdminNavGroup,
  type AdminIconName,
} from "@/components/admin/admin-nav";
import { getT } from "@/lib/i18n";
import type { DictKey } from "@/lib/i18n-dict";
import { isInitialized } from "@/lib/install-state";

type AdminItem = { labelKey: DictKey; href: string; icon: AdminIconName };

const ADMIN_ONLY = new Set([
  "/admin/navigation",
  "/admin/theme",
  "/admin/ai",
  "/admin/users",
  "/admin/settings",
]);

const ALL_GROUPS: Array<{ titleKey: DictKey; items: AdminItem[] }> = [
  {
    titleKey: "admin.group.overview",
    items: [{ labelKey: "admin.item.dashboard", href: "/admin", icon: "LayoutDashboard" }],
  },
  {
    titleKey: "admin.group.content",
    items: [
      { labelKey: "admin.item.articles", href: "/admin/articles", icon: "FileText" },
      { labelKey: "admin.item.categories", href: "/admin/categories", icon: "FolderTree" },
      { labelKey: "admin.item.tags", href: "/admin/tags", icon: "Tag" },
      { labelKey: "admin.item.comments", href: "/admin/comments", icon: "MessageSquare" },
      { labelKey: "admin.item.pages", href: "/admin/pages", icon: "FileEdit" },
      { labelKey: "admin.item.media", href: "/admin/media", icon: "Image" },
    ],
  },
  {
    titleKey: "admin.group.configuration",
    items: [
      { labelKey: "admin.item.navigation", href: "/admin/navigation", icon: "Navigation" },
      { labelKey: "admin.item.theme", href: "/admin/theme", icon: "Palette" },
      { labelKey: "admin.item.ai", href: "/admin/ai", icon: "Bot" },
      { labelKey: "admin.item.users", href: "/admin/users", icon: "Users" },
      { labelKey: "admin.item.settings", href: "/admin/settings", icon: "Settings" },
    ],
  },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isInitialized())) redirect("/setup");
  const session = await auth();
  if (!session?.user) redirect("/login?next=/admin");
  const role = session.user.role;
  if (role !== "ADMIN" && role !== "AUTHOR") redirect("/");
  if (session.user.status !== "ACTIVE") redirect("/");

  const isAdmin = role === "ADMIN";
  const { t } = await getT();

  const groups: AdminNavGroup[] = ALL_GROUPS.map((g) => ({
    title: t(g.titleKey),
    items: g.items
      .filter((it) => isAdmin || !ADMIN_ONLY.has(it.href))
      .map((it) => ({ label: t(it.labelKey), href: it.href, icon: it.icon })),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="flex min-h-dvh bg-[var(--color-canvas)]">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] md:flex">
        <Link href="/admin" className="px-5 py-5 no-underline">
          <span className="flex items-center gap-2">
            <span className="font-serif text-lg font-medium tracking-tight">Blog</span>
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" aria-hidden />
          </span>
          <p className="mt-0.5 text-xs text-[var(--color-foreground-subtle)]">{t("admin.sidebar.label")}</p>
        </Link>
        <Separator />
        <AdminNav groups={groups} />
        <div className="border-t border-[var(--color-border)] px-3 py-3">
          <Link
            href="/"
            className="block rounded-[var(--radius-sm)] px-2 py-1.5 text-xs text-[var(--color-foreground-muted)] no-underline transition-colors hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]"
          >
            {t("admin.backToSite")}
          </Link>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-end gap-2 border-b border-[var(--color-border)] bg-[oklch(from_var(--color-canvas)_l_c_h/0.85)] px-6 backdrop-blur-md">
          <LanguageSwitcher />
          <ColorThemeSwitcher />
          <ThemeToggle />
          <Separator orientation="vertical" className="mx-1 h-6" />
          <AccountMenu
            user={{
              name: session.user.name ?? null,
              email: session.user.email ?? "",
              image: session.user.image ?? null,
              role,
            }}
          />
        </header>
        <main className="flex-1 overflow-x-hidden">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
