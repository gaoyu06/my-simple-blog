import Link from "next/link";
import { Search } from "lucide-react";

import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NavLinks, type NavLink } from "@/components/site/nav-links";

export function SiteHeader({ siteName, navItems }: { siteName: string; navItems: NavLink[] }) {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[oklch(from_var(--color-canvas)_l_c_h/0.88)] backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-8 px-4 sm:px-6">
        <Link href="/" className="shrink-0 whitespace-nowrap text-[16px] font-semibold tracking-tight">
          {siteName}
        </Link>
        <NavLinks items={navItems} className="hidden items-center gap-6 md:flex" />
        <div className="ml-auto flex items-center gap-1">
          <Link
            href="/search"
            aria-label="搜索"
            className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-foreground-muted)] transition-colors hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]"
          >
            <Search className="h-4 w-4" aria-hidden />
          </Link>
          <ThemeToggle />
        </div>
      </div>
      {/* Phones: the same links in a scrollable row, one tap away. */}
      <NavLinks
        items={navItems}
        className="no-scrollbar flex items-center gap-5 overflow-x-auto px-4 pb-2.5 md:hidden"
      />
    </header>
  );
}
