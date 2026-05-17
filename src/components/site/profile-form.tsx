"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useT } from "@/components/i18n-provider";
import { updateProfile } from "@/server/actions/profile";

interface ProfileFormProps {
  initial: {
    name: string;
    username: string;
    bio: string;
    image: string;
  };
}

export function ProfileForm({ initial }: ProfileFormProps) {
  const router = useRouter();
  const { t } = useT();
  const [data, setData] = React.useState(initial);
  const [pending, setPending] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setFieldErrors({});
    try {
      const result = await updateProfile(data);
      if (!result.ok) {
        toast.error(result.error);
        if (result.fields) setFieldErrors(result.fields);
        return;
      }
      toast.success(t("common.saved"));
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">{t("account.field.name")}</Label>
        <Input
          id="name"
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
          placeholder={t("account.field.namePlaceholder")}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="username">{t("account.field.username")}</Label>
        <Input
          id="username"
          value={data.username}
          onChange={(e) => setData({ ...data, username: e.target.value })}
          placeholder={t("account.field.usernamePlaceholder")}
          autoComplete="off"
        />
        {fieldErrors.username ? (
          <p className="text-xs text-[var(--color-danger)]">{fieldErrors.username}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="image">{t("account.field.image")}</Label>
        <Input
          id="image"
          value={data.image}
          onChange={(e) => setData({ ...data, image: e.target.value })}
          placeholder="https://… or /uploads/…"
        />
        {fieldErrors.image ? (
          <p className="text-xs text-[var(--color-danger)]">{fieldErrors.image}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bio">{t("account.field.bio")}</Label>
        <Textarea
          id="bio"
          value={data.bio}
          onChange={(e) => setData({ ...data, bio: e.target.value })}
          rows={4}
          placeholder={t("account.field.bioPlaceholder")}
        />
      </div>

      <div>
        <Button type="submit" loading={pending}>
          {t("common.save")}
        </Button>
      </div>
    </form>
  );
}
