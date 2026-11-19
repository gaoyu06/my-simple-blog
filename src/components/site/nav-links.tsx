"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavLink = { label: string; href: string; external?: boolean };

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLinks({ items, className }: { items: NavLink[]; className?: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label="主导航" className={className}>
      {items.map((item) => {
        const active = !item.external && isActive(pathname, item.href);
        return (
          <Link
            key={`${item.href}-${item.label}`}
            href={item.href}
            target={item.external ? "_blank" : undefined}
            rel={item.external ? "noopener noreferrer" : undefined}
            aria-current={active ? "page" : undefined}
            className={`shrink-0 whitespace-nowrap py-1 text-[14px] transition-colors ${
              active
                ? "text-[var(--color-foreground)]"
                : "text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)]"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
