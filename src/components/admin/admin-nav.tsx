"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Tag,
  MessageSquare,
  Users,
  Settings,
  Bot,
  FileEdit,
  Navigation,
  Palette,
  Image as ImageIcon,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

// Client-side icon map. Server passes an icon name string; client looks up the component.
// This is required because lucide icons (with $$typeof / render) cannot cross the RSC boundary.
const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  FileText,
  FolderTree,
  Tag,
  MessageSquare,
  Users,
  Settings,
  Bot,
  FileEdit,
  Navigation,
  Palette,
  Image: ImageIcon,
};

export type AdminIconName = keyof typeof ICONS;

export interface AdminNavItem {
  label: string;
  href: string;
  icon: AdminIconName;
}

export interface AdminNavGroup {
  title: string;
  items: AdminNavItem[];
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav({ groups }: { groups: AdminNavGroup[] }) {
  const pathname = usePathname() ?? "";
  return (
    <nav className="flex-1 overflow-y-auto px-3 py-3" aria-label="Admin">
      {groups.map((group) => (
        <div key={group.title} className="mb-4">
          <p className="px-2 pb-1 font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--color-foreground-subtle)]">
            {group.title}
          </p>
          <ul className="flex flex-col gap-0.5">
            {group.items.map((it) => {
              const Icon = ICONS[it.icon] ?? FileText;
              const active = isActive(pathname, it.href);
              return (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative flex items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 text-sm no-underline",
                      "transition-[background-color,color] duration-200 ease-[var(--ease-out-soft)]",
                      active
                        ? "bg-[var(--color-primary-subtle)] text-[var(--color-primary)] shadow-[inset_0_0_0_1px_oklch(from_var(--color-primary)_l_c_h/0.18)]"
                        : "text-[var(--color-foreground-muted)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    <span className="flex-1">{it.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
