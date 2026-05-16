"use client";

import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { CommentForm } from "@/components/comments/comment-form";
import { useT } from "@/components/i18n-provider";
import { deleteComment } from "@/server/actions/comments";

export interface CommentNodeProps {
  comment: {
    id: string;
    content: string;
    contentHtml: string | null;
    createdAt: Date;
    authorName: string | null;
    authorWebsite: string | null;
    author: { id: string; name: string | null; username: string | null; image: string | null } | null;
  };
  articleId: string;
  isLoggedIn: boolean;
  allowAnonymous: boolean;
  needsApproval: boolean;
  canDelete: boolean;
  depth: number;
  children?: React.ReactNode;
}

export function CommentItem({
  comment,
  articleId,
  isLoggedIn,
  allowAnonymous,
  needsApproval,
  canDelete,
  depth,
  children,
}: CommentNodeProps) {
  const router = useRouter();
  const { t } = useT();
  const [replying, setReplying] = React.useState(false);

  async function onDelete() {
    if (!confirm(t("comments.action.delete") + "?")) return;
    const result = await deleteComment(comment.id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(t("comments.toast.deleted"));
    router.refresh();
  }

  const author = comment.author?.name ?? comment.authorName ?? t("article.anonymous");
  const initials = author.slice(0, 2).toUpperCase();
  const websiteHref = comment.authorWebsite ?? null;

  return (
    <article className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-subtle)] text-xs font-medium text-[var(--color-primary)] shadow-[inset_0_0_0_1px_oklch(from_var(--color-primary)_l_c_h/0.25)]">
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <header className="mb-1 flex items-baseline gap-2 text-sm">
          {websiteHref ? (
            <a
              href={websiteHref}
              target="_blank"
              rel="noopener noreferrer ugc"
              className="font-medium text-[var(--color-foreground)] no-underline hover:text-[var(--color-primary)]"
            >
              {author}
            </a>
          ) : (
            <span className="font-medium text-[var(--color-foreground)]">{author}</span>
          )}
          <time className="text-xs text-[var(--color-foreground-subtle)]" dateTime={comment.createdAt.toISOString()}>
            {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
          </time>
        </header>
        <div
          className="prose prose-sm max-w-none text-[var(--color-foreground)]"
          dangerouslySetInnerHTML={{ __html: comment.contentHtml ?? comment.content }}
        />
        <div className="mt-2 flex items-center gap-2">
          {depth < 1 ? (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setReplying((v) => !v)}
              className="h-7 px-2 text-xs"
            >
              {replying ? t("comments.action.cancel") : t("comments.action.reply")}
            </Button>
          ) : null}
          {canDelete ? (
            <Button size="sm" variant="ghost" onClick={onDelete} className="h-7 px-2 text-xs">
              {t("comments.action.delete")}
            </Button>
          ) : null}
        </div>
        {replying ? (
          <div className="mt-3 rounded-[var(--radius-md)] bg-[var(--color-surface)] p-3 shadow-[inset_0_0_0_1px_var(--color-border)]">
            <CommentForm
              articleId={articleId}
              parentId={comment.id}
              isLoggedIn={isLoggedIn}
              allowAnonymous={allowAnonymous}
              needsApproval={needsApproval}
              compact
              onPosted={() => {
                setReplying(false);
                router.refresh();
              }}
            />
          </div>
        ) : null}
        {children ? <div className="mt-4 flex flex-col gap-4 border-l border-[var(--color-border)] pl-4">{children}</div> : null}
      </div>
    </article>
  );
}
