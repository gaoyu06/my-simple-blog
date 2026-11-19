import { getCommentPolicy } from "@/server/queries/site";
import { listApprovedComments } from "@/server/queries/comments";
import { CommentForm } from "@/components/comments/comment-form";
import { CommentItem } from "@/components/comments/comment-item";
import { Toaster } from "@/components/toaster";

export async function CommentSection({ articleId, allowComment }: { articleId: string; allowComment: boolean }) {
  if (!allowComment) {
    return <p className="text-sm text-[var(--color-foreground-subtle)]">本文已关闭评论。</p>;
  }
  const [policy, comments] = await Promise.all([getCommentPolicy(), listApprovedComments(articleId)]);
  const replies = new Map<string, typeof comments>();
  for (const c of comments) {
    if (c.parentId) replies.set(c.parentId, [...(replies.get(c.parentId) ?? []), c]);
  }
  const shared = { articleId, allowAnonymous: policy.allowAnonymous, needsApproval: policy.needsApproval };

  return (
    <section aria-labelledby="comments-heading" className="flex flex-col gap-8">
      <h2 id="comments-heading" className="text-lg font-semibold">
        评论{comments.length ? <span className="ml-2 font-mono text-sm font-normal text-[var(--color-foreground-subtle)]">{comments.length}</span> : null}
      </h2>
      {comments.length ? (
        <ul className="flex flex-col gap-7">
          {comments
            .filter((c) => !c.parentId)
            .map((c) => (
              <li key={c.id}>
                <CommentItem comment={c} canReply {...shared}>
                  {replies.get(c.id)?.map((r) => <CommentItem key={r.id} comment={r} canReply={false} {...shared} />)}
                </CommentItem>
              </li>
            ))}
        </ul>
      ) : null}
      <CommentForm {...shared} />
      <Toaster />
    </section>
  );
}
