"use client";

import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useT } from "@/components/i18n-provider";
import { postComment } from "@/server/actions/comments";

interface CommentFormProps {
  articleId: string;
  parentId?: string;
  isLoggedIn: boolean;
  allowAnonymous: boolean;
  needsApproval: boolean;
  onPosted?: () => void;
  compact?: boolean;
}

export function CommentForm({
  articleId,
  parentId,
  isLoggedIn,
  allowAnonymous,
  needsApproval,
  onPosted,
  compact,
}: CommentFormProps) {
  const { t } = useT();
  const [content, setContent] = React.useState("");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [website, setWebsite] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  if (!isLoggedIn && !allowAnonymous) {
    return (
      <p className="text-sm text-[var(--color-foreground-muted)]">
        {t("comments.form.signIn.required")} <a href="/login">{t("common.signIn")}</a>
      </p>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const formEl = e.currentTarget;
    const honeypot = (formEl.elements.namedItem("website_h") as HTMLInputElement)?.value ?? "";
    const result = await postComment({
      articleId,
      parentId,
      content,
      authorName: isLoggedIn ? undefined : name,
      authorEmail: isLoggedIn ? undefined : email,
      authorWebsite: website || undefined,
      honeypot,
    });
    setSubmitting(false);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(result.pending ? t("comments.toast.pending") : t("comments.toast.posted"));
    setContent("");
    setWebsite("");
    onPosted?.();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      {!isLoggedIn ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`name-${parentId ?? "root"}`}>{t("comments.form.name")}</Label>
            <Input
              id={`name-${parentId ?? "root"}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`email-${parentId ?? "root"}`}>{t("comments.form.email")}</Label>
            <Input
              id={`email-${parentId ?? "root"}`}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
        </div>
      ) : null}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`content-${parentId ?? "root"}`}>{t("comments.form.content")}</Label>
        <Textarea
          id={`content-${parentId ?? "root"}`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={compact ? 3 : 4}
          placeholder={t("comments.form.placeholder")}
        />
      </div>
      {!compact && !isLoggedIn ? (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`web-${parentId ?? "root"}`}>{t("comments.form.website")}</Label>
          <Input
            id={`web-${parentId ?? "root"}`}
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://"
          />
        </div>
      ) : null}
      <input
        type="text"
        name="website_h"
        tabIndex={-1}
        autoComplete="off"
        className="absolute -left-[9999px]"
        aria-hidden
      />
      <div className="flex items-center justify-between gap-2 text-xs text-[var(--color-foreground-subtle)]">
        <span>
          {needsApproval ? t("comments.form.policy.review") : t("comments.form.policy.public")}
        </span>
        <Button type="submit" loading={submitting} size="sm">
          {parentId ? t("comments.form.reply") : t("comments.form.submit")}
        </Button>
      </div>
    </form>
  );
}
