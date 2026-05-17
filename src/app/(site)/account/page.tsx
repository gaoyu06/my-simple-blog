import { redirect } from "next/navigation";
import { format } from "date-fns";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getT } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { ProfileForm } from "@/components/site/profile-form";

export const metadata = { title: "Account" };

const ROLE_KEY = {
  ADMIN: "account.role.admin",
  AUTHOR: "account.role.author",
  GUEST: "account.role.guest",
} as const;

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?from=/account");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      image: true,
      bio: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });
  if (!user) redirect("/login");

  const { t } = await getT();
  const initials = (user.name ?? user.email).slice(0, 2).toUpperCase();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="mb-10">
        <p className="eyebrow mb-2">{t("account.eyebrow")}</p>
        <h1 className="font-serif text-4xl font-medium tracking-tight">
          {t("account.title")}
        </h1>
      </div>

      <Card className="mb-6">
        <CardContent className="flex items-center gap-4 p-5">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt=""
              className="h-14 w-14 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-subtle)] text-base font-medium text-[var(--color-primary)] shadow-[inset_0_0_0_1px_oklch(from_var(--color-primary)_l_c_h/0.20)]">
              {initials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-serif text-lg font-medium">
              {user.name ?? user.email}
            </p>
            <p className="truncate text-sm text-[var(--color-foreground-muted)]">
              {user.email}
            </p>
            <p className="mt-1 flex items-center gap-2 text-xs text-[var(--color-foreground-subtle)]">
              <span>{t(ROLE_KEY[user.role])}</span>
              <span aria-hidden>·</span>
              <span>
                {t("account.joined", { date: format(user.createdAt, "yyyy.MM.dd") })}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <ProfileForm
            initial={{
              name: user.name ?? "",
              username: user.username ?? "",
              bio: user.bio ?? "",
              image: user.image ?? "",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
