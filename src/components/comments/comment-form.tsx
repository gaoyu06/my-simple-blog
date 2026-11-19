"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { postComment } from "@/server/actions/comments";

// Pages are static, so the signed-in state is looked up in the browser.
let sessionPromise: Promise<boolean> | null = null;
function useSignedIn(): boolean {
  const [signedIn, setSignedIn] = React.useState(false);
  React.useEffect(() => {
    sessionPromise ??= fetch("/api/auth/session")
      .then((r) => r.json())
      .then((s: { user?: unknown } | null) => Boolean(s?.user))
      .catch(() => false);
    void sessionPromise.then(setSignedIn);
  }, []);
  return signedIn;
}

interface CommentFormProps {
  articleId: string;
  parentId?: string;
  allowAnonymous: boolean;
  needsApproval: boolean;
  onPosted?: () => void;
  compact?: boolean;
}

export function CommentForm({ articleId, parentId, allowAnonymous, needsApproval, onPosted, compact }: CommentFormProps) {
  const isLoggedIn = useSignedIn();
  const [content, setContent] = React.useState("");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [website, setWebsite] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const key = parentId ?? "root";

  if (!isLoggedIn && !allowAnonymous) {
    return (
      <p className="text-sm text-[var(--color-foreground-muted)]">
        <Link href="/login">登录</Link>后可以评论。
      </p>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const honeypot = (e.currentTarget.elements.namedItem("website_h") as HTMLInputElement | null)?.value ?? "";
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
    toast.success(result.pending ? "评论已提交，审核后显示" : "评论已发布");
    setContent("");
    setWebsite("");
    onPosted?.();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`content-${key}`} className="sr-only">
          评论内容
        </Label>
        <Textarea
          id={`content-${key}`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={compact ? 3 : 4}
          placeholder="写下你的看法，支持 Markdown"
        />
      </div>
      {!isLoggedIn ? (
        <div className={`grid gap-3 ${compact ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`name-${key}`}>昵称</Label>
            <Input id={`name-${key}`} value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`email-${key}`}>邮箱（不公开）</Label>
            <Input
              id={`email-${key}`}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          {!compact ? (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`web-${key}`}>网站（选填）</Label>
              <Input
                id={`web-${key}`}
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://"
              />
            </div>
          ) : null}
        </div>
      ) : null}
      <input type="text" name="website_h" tabIndex={-1} autoComplete="off" className="absolute -left-[9999px]" aria-hidden />
      <div className="flex items-center justify-between gap-2 text-xs text-[var(--color-foreground-subtle)]">
        <span>{needsApproval ? "评论经审核后显示" : ""}</span>
        <Button type="submit" loading={submitting} size="sm">
          {parentId ? "回复" : "发表评论"}
        </Button>
      </div>
    </form>
  );
}
