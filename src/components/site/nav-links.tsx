"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavLink = { label: string; href: string; external?: boolean };

function isActive(pathname: string, href: string) {
  if (href === "/" || href === "/en") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLinks({ items, className, label = "主导航" }: { items: NavLink[]; className?: string; label?: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label={label} className={className}>
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
