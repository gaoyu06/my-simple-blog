import { formatDistanceToNow } from "date-fns";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { CommentsModerator } from "@/components/admin/comments-moderator";
import { getT } from "@/lib/i18n";

export const metadata = { title: "Comments" };

export default async function CommentsAdmin() {
  const session = await auth();
  const role = session!.user.role;
  const where = role === "ADMIN" ? {} : { article: { authorId: session!.user.id } };
  const [comments, { t }] = await Promise.all([
    db.comment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        article: { select: { id: true, slug: true, title: true, authorId: true } },
        author: { select: { name: true, email: true } },
      },
    }),
    getT(),
  ]);
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <p className="eyebrow mb-1">{t("admin.comments.eyebrow")}</p>
        <h1 className="font-serif text-3xl font-medium tracking-tight">{t("admin.comments.title")}</h1>
      </div>
      <Card className="overflow-hidden">
        <CommentsModerator
          rows={comments.map((c) => ({
            id: c.id,
            content: c.content,
            status: c.status,
            createdAtRelative: formatDistanceToNow(c.createdAt, { addSuffix: true }),
            authorLabel: c.author?.name ?? c.authorName ?? c.author?.email ?? c.authorEmail ?? t("article.anonymous"),
            articleSlug: c.article.slug,
            articleTitle: c.article.title,
          }))}
        />
      </Card>
    </div>
  );
}
