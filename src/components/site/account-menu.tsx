"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, LayoutDashboard, User as UserIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useT } from "@/components/i18n-provider";
import { logoutAction } from "@/server/auth-actions";

type AccountMenuProps = {
  user: { name: string | null; email: string; image: string | null; role: "ADMIN" | "AUTHOR" | "GUEST" };
};

export function AccountMenu({ user }: AccountMenuProps) {
  const router = useRouter();
  const { t } = useT();
  const [pending, startTransition] = useTransition();
  const initials = (user.name ?? user.email).slice(0, 2).toUpperCase();
  const canAccessAdmin = user.role === "ADMIN" || user.role === "AUTHOR";

  function handleLogout() {
    startTransition(async () => {
      await logoutAction();
      router.refresh();
    });
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary-subtle)] text-xs font-medium text-[var(--color-primary)] shadow-[inset_0_0_0_1px_oklch(from_var(--color-primary)_l_c_h/0.20)] transition-shadow hover:shadow-[inset_0_0_0_1px_oklch(from_var(--color-primary)_l_c_h/0.35)]"
          aria-label={t("account.aria")}
          disabled={pending}
        >
          {initials}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="min-w-[200px] rounded-[var(--radius-md)] bg-[var(--color-elevated)] p-1 shadow-[var(--shadow-elevated),inset_0_0_0_1px_var(--color-border)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        >
          <div className="px-3 py-2 text-xs">
            <p className="truncate font-medium text-[var(--color-foreground)]">
              {user.name ?? user.email}
            </p>
            <p className="truncate text-[var(--color-foreground-subtle)]">{user.email}</p>
          </div>
          <DropdownMenu.Separator className="my-1 h-px bg-[var(--color-border)]" />
          {canAccessAdmin ? (
            <DropdownMenu.Item asChild>
              <Link
                href="/admin"
                className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 text-sm text-[var(--color-foreground)] no-underline outline-none transition-colors hover:bg-[var(--color-muted)] data-[highlighted]:bg-[var(--color-muted)]"
              >
                <LayoutDashboard className="h-4 w-4" aria-hidden />
                {t("account.dashboard")}
              </Link>
            </DropdownMenu.Item>
          ) : null}
          <DropdownMenu.Item asChild>
            <Link
              href="/account"
              className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 text-sm text-[var(--color-foreground)] no-underline outline-none transition-colors hover:bg-[var(--color-muted)] data-[highlighted]:bg-[var(--color-muted)]"
            >
              <UserIcon className="h-4 w-4" aria-hidden />
              {t("account.profile")}
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 h-px bg-[var(--color-border)]" />
          <DropdownMenu.Item asChild>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1.5 text-sm text-[var(--color-foreground)] outline-none transition-colors hover:bg-[var(--color-muted)] data-[highlighted]:bg-[var(--color-muted)]"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              {t("common.signOut")}
            </button>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
