import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { getCommentPolicy } from "@/server/queries/site";
import { listApprovedComments } from "@/server/queries/comments";
import { CommentForm } from "@/components/comments/comment-form";
import { CommentItem } from "@/components/comments/comment-item";
import { getT } from "@/lib/i18n";

interface CommentSectionProps {
  articleId: string;
  allowComment: boolean;
}

export async function CommentSection({ articleId, allowComment }: CommentSectionProps) {
  const { t } = await getT();
  if (!allowComment) {
    return (
      <p className="text-sm text-[var(--color-foreground-subtle)]">
        {t("comments.closed")}
      </p>
    );
  }
  const [session, policy, comments] = await Promise.all([
    auth(),
    getCommentPolicy(),
    listApprovedComments(articleId),
  ]);

  const tops = comments.filter((c) => !c.parentId);
  const childrenByParent = new Map<string, typeof comments>();
  for (const c of comments) {
    if (!c.parentId) continue;
    const arr = childrenByParent.get(c.parentId) ?? [];
    arr.push(c);
    childrenByParent.set(c.parentId, arr);
  }

  const canDeleteAny = Boolean(session?.user);
  const isLoggedIn = Boolean(session?.user);

  return (
    <section aria-labelledby="comments-heading" className="flex flex-col gap-6">
      <header className="flex items-baseline justify-between">
        <h2 id="comments-heading" className="font-serif text-2xl font-medium tracking-tight">
          {t("comments.heading")}
        </h2>
        <span className="font-mono text-xs uppercase tabular-nums tracking-wider text-[var(--color-foreground-subtle)]">
          {comments.length === 1 ? t("comments.countOne") : t("comments.count", { count: comments.length })}
        </span>
      </header>

      <Card>
        <CardContent className="py-5">
          <CommentForm
            articleId={articleId}
            isLoggedIn={isLoggedIn}
            allowAnonymous={policy.allowAnonymous}
            needsApproval={policy.needsApproval}
          />
        </CardContent>
      </Card>

      {tops.length === 0 ? (
        <p className="py-6 text-center text-sm text-[var(--color-foreground-muted)]">
          {t("comments.empty")}
        </p>
      ) : (
        <ul className="flex flex-col gap-6">
          {tops.map((c) => {
            const kids = childrenByParent.get(c.id) ?? [];
            return (
              <li key={c.id}>
                <CommentItem
                  comment={c}
                  articleId={articleId}
                  isLoggedIn={isLoggedIn}
                  allowAnonymous={policy.allowAnonymous}
                  needsApproval={policy.needsApproval}
                  canDelete={canDeleteAny && (session?.user.role === "ADMIN" || session?.user.id === c.author?.id)}
                  depth={0}
                >
                  {kids.length > 0 ? (
                    <ul className="flex flex-col gap-4">
                      {kids.map((r) => (
                        <li key={r.id}>
                          <CommentItem
                            comment={r}
                            articleId={articleId}
                            isLoggedIn={isLoggedIn}
                            allowAnonymous={policy.allowAnonymous}
                            needsApproval={policy.needsApproval}
                            canDelete={
                              canDeleteAny && (session?.user.role === "ADMIN" || session?.user.id === r.author?.id)
                            }
                            depth={1}
                          />
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </CommentItem>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
