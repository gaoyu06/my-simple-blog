"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/components/i18n-provider";
import { registerAction } from "@/server/auth-actions";

export function RegisterForm() {
  const router = useRouter();
  const { t } = useT();
  const [pending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    const form = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await registerAction(form);
      if (!result.ok) {
        setError(result.error);
        if (result.fields) setFieldErrors(result.fields);
        toast.error(result.error);
        return;
      }
      const data = result.data as { needsApproval?: boolean } | undefined;
      if (data?.needsApproval) {
        toast.success(t("auth.toast.pending"));
        router.push("/login?pending=1");
        return;
      }
      toast.success(t("auth.toast.welcome"));
      router.push("/");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">{t("auth.register.name")}</Label>
        <Input id="name" name="name" type="text" autoComplete="name" placeholder={t("auth.register.namePlaceholder")} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="username">{t("auth.register.username")}</Label>
        <Input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          placeholder={t("auth.register.usernamePlaceholder")}
        />
        {fieldErrors.username ? (
          <p className="text-xs text-[var(--color-danger)]">{fieldErrors.username}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">{t("auth.register.email")}</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
        {fieldErrors.email ? (
          <p className="text-xs text-[var(--color-danger)]">{fieldErrors.email}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">{t("auth.register.password")}</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} />
        {fieldErrors.password ? (
          <p className="text-xs text-[var(--color-danger)]">{fieldErrors.password}</p>
        ) : null}
      </div>
      {error && !Object.keys(fieldErrors).length ? (
        <p className="text-sm text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" loading={pending} className="mt-2">
        {t("auth.register.submit")}
      </Button>
      <p className="text-center text-sm text-[var(--color-foreground-muted)]">
        {t("auth.register.haveAccount")}{" "}
        <Link href="/login" className="text-[var(--color-foreground)]">
          {t("common.signIn")}
        </Link>
      </p>
    </form>
  );
}
