import Link from "next/link";
import { Search as SearchIcon } from "lucide-react";

import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ColorThemeSwitcher } from "@/components/ui/color-theme-switcher";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AccountMenu } from "@/components/site/account-menu";
import { auth } from "@/lib/auth";
import { getT } from "@/lib/i18n";
import type { DictKey } from "@/lib/i18n-dict";

interface SiteHeaderProps {
  siteName?: string;
  navItems?: Array<{ label: string; href: string; external?: boolean }>;
}

// Auto-translate well-known seeded nav labels. Custom labels pass through verbatim.
const KNOWN_NAV_LABELS: Record<string, DictKey> = {
  Home: "nav.home",
  Archive: "nav.archive",
  Categories: "nav.categories",
  Tags: "nav.tags",
};

export async function SiteHeader({ siteName = "Blog", navItems }: SiteHeaderProps) {
  const [session, { t }] = await Promise.all([auth(), getT()]);

  const items: NonNullable<SiteHeaderProps["navItems"]> =
    navItems ??
    [
      { label: "Home", href: "/" },
      { label: "Archive", href: "/archive" },
      { label: "Categories", href: "/categories" },
      { label: "Tags", href: "/tags" },
    ];

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[oklch(from_var(--color-canvas)_l_c_h/0.82)] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center gap-6 px-6">
        <Link href="/" className="group flex items-center gap-2 no-underline">
          <span className="font-serif text-lg font-medium tracking-tight text-[var(--color-foreground)]">
            {siteName}
          </span>
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)] opacity-80"
          />
        </Link>
        <nav className="ml-2 hidden items-center gap-6 md:flex" aria-label="Main">
          {items.map((item) => {
            const dictKey = KNOWN_NAV_LABELS[item.label];
            const label = dictKey ? t(dictKey) : item.label;
            return (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                className="text-sm text-[var(--color-foreground-muted)] no-underline transition-colors hover:text-[var(--color-foreground)]"
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <Link
            href="/search"
            aria-label={t("header.search.aria")}
            className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-foreground)] no-underline transition-colors hover:bg-[var(--color-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-canvas)]"
          >
            <SearchIcon className="h-4 w-4" aria-hidden />
          </Link>
          <LanguageSwitcher />
          <ColorThemeSwitcher />
          <ThemeToggle />
          <Separator orientation="vertical" className="mx-1 h-6" />
          {session?.user ? (
            <AccountMenu
              user={{
                name: session.user.name ?? null,
                email: session.user.email ?? "",
                image: session.user.image ?? null,
                role: session.user.role,
              }}
            />
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">{t("common.signIn")}</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
