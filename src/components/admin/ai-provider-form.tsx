"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useT } from "@/components/i18n-provider";
import { saveProvider } from "@/server/actions/ai-providers";

interface Initial {
  id?: string;
  name: string;
  kind: "LLM" | "IMAGE";
  baseUrl: string;
  model: string;
  isDefault: boolean;
  enabled: boolean;
  extra: string;
}

const DEFAULT: Initial = {
  name: "",
  kind: "LLM",
  baseUrl: "https://api.openai.com/v1",
  model: "gpt-4o-mini",
  isDefault: true,
  enabled: true,
  extra: "",
};

export function AIProviderForm({
  initial,
  onSaved,
}: {
  initial?: Initial;
  onSaved?: () => void;
}) {
  const router = useRouter();
  const { t } = useT();
  const [data, setData] = React.useState<Initial>(initial ?? DEFAULT);
  const [apiKey, setApiKey] = React.useState("");
  const [pending, setPending] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    try {
      const result = await saveProvider({ ...data, apiKey });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(t("common.saved"));
      if (!initial) {
        setData(DEFAULT);
        setApiKey("");
      }
      onSaved?.();
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="provider-name">{t("admin.ai.field.name")}</Label>
        <Input
          id="provider-name"
          value={data.name}
          onChange={(e) => setData({ ...data, name: e.target.value })}
          placeholder={t("admin.ai.field.namePlaceholder")}
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="provider-kind">{t("admin.ai.field.kind")}</Label>
        <Select
          value={data.kind}
          onValueChange={(v) => setData({ ...data, kind: v as "LLM" | "IMAGE" })}
        >
          <SelectTrigger id="provider-kind">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="LLM">{t("admin.ai.field.kindLLM")}</SelectItem>
            <SelectItem value="IMAGE">{t("admin.ai.field.kindImage")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="provider-baseUrl">{t("admin.ai.field.baseUrl")}</Label>
        <Input
          id="provider-baseUrl"
          value={data.baseUrl}
          onChange={(e) => setData({ ...data, baseUrl: e.target.value })}
          placeholder="https://api.openai.com/v1"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="provider-model">{t("admin.ai.field.model")}</Label>
        <Input
          id="provider-model"
          value={data.model}
          onChange={(e) => setData({ ...data, model: e.target.value })}
          placeholder="gpt-4o-mini"
          required
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="provider-key">
          {t("admin.ai.field.apiKey")}{" "}
          {initial ? <span className="text-[var(--color-foreground-subtle)] font-normal">{t("admin.ai.field.apiKeyEditHint")}</span> : null}
        </Label>
        <Input
          id="provider-key"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-…"
          required={!initial}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="provider-extra">{t("admin.ai.field.extra")}</Label>
        <Textarea
          id="provider-extra"
          value={data.extra}
          onChange={(e) => setData({ ...data, extra: e.target.value })}
          placeholder='{"temperature": 0.6}'
          rows={2}
        />
      </div>
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={data.isDefault}
            onChange={(e) => setData({ ...data, isDefault: e.target.checked })}
            className="h-4 w-4 accent-[var(--color-primary)]"
          />
          {t("admin.ai.field.isDefault")}
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={data.enabled}
            onChange={(e) => setData({ ...data, enabled: e.target.checked })}
            className="h-4 w-4 accent-[var(--color-primary)]"
          />
          {t("admin.ai.field.enabled")}
        </label>
      </div>
      <Button type="submit" loading={pending} className="mt-1">
        {initial ? t("admin.ai.saveEdit") : t("admin.ai.save")}
      </Button>
    </form>
  );
}
