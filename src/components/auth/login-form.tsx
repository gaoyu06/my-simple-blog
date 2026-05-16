"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/components/i18n-provider";
import { loginAction } from "@/server/auth-actions";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useT();
  const next = searchParams.get("next") ?? "/";
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    form.set("redirectTo", next);
    startTransition(async () => {
      const result = await loginAction(form);
      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      router.push(next);
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">{t("auth.signIn.email")}</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">{t("auth.signIn.password")}</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      {error ? (
        <p className="text-sm text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" loading={pending} className="mt-2">
        {t("auth.signIn.submit")}
      </Button>
      <p className="text-center text-sm text-[var(--color-foreground-muted)]">
        {t("auth.signIn.noAccount")}{" "}
        <Link href="/register" className="text-[var(--color-foreground)]">
          {t("auth.signIn.createOne")}
        </Link>
      </p>
    </form>
  );
}
