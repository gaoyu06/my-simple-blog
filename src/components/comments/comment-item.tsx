"use client";

import * as React from "react";
import { formatDate } from "@/lib/date";

import { CommentForm } from "@/components/comments/comment-form";

export interface CommentNodeProps {
  comment: {
    id: string;
    contentHtml: string | null;
    content: string;
    createdAt: Date;
    authorName: string | null;
    authorWebsite: string | null;
    author: { name: string | null; username: string | null } | null;
  };
  articleId: string;
  allowAnonymous: boolean;
  needsApproval: boolean;
  canReply: boolean;
  children?: React.ReactNode;
}

export function CommentItem({ comment, articleId, allowAnonymous, needsApproval, canReply, children }: CommentNodeProps) {
  const [replying, setReplying] = React.useState(false);
  const author = comment.author?.name ?? comment.author?.username ?? comment.authorName ?? "匿名";

  return (
    <article className="flex flex-col gap-1.5">
      <header className="flex items-baseline gap-3 text-sm">
        {comment.authorWebsite ? (
          <a href={comment.authorWebsite} target="_blank" rel="noopener noreferrer ugc nofollow" className="font-medium">
            {author}
          </a>
        ) : (
          <span className="font-medium">{author}</span>
        )}
        <time className="font-mono text-xs text-[var(--color-foreground-subtle)]" dateTime={new Date(comment.createdAt).toISOString()}>
          {formatDate(comment.createdAt)}
        </time>
      </header>
      <div className="comment-body" dangerouslySetInnerHTML={{ __html: comment.contentHtml ?? "" }} />
      {canReply ? (
        <button
          type="button"
          onClick={() => setReplying((v) => !v)}
          className="self-start text-xs text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)]"
        >
          {replying ? "取消回复" : "回复"}
        </button>
      ) : null}
      {replying ? (
        <div className="mt-2">
          <CommentForm
            articleId={articleId}
            parentId={comment.id}
            allowAnonymous={allowAnonymous}
            needsApproval={needsApproval}
            compact
            onPosted={() => setReplying(false)}
          />
        </div>
      ) : null}
      {children ? <div className="mt-3 flex flex-col gap-5 border-l border-[var(--color-border)] pl-4">{children}</div> : null}
    </article>
  );
}
