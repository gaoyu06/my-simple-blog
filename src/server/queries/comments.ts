import "server-only";
import { db } from "@/lib/db";

export type CommentNode = Awaited<ReturnType<typeof listApprovedComments>>[number];

export async function listApprovedComments(articleId: string) {
  return db.comment.findMany({
    where: { articleId, status: "APPROVED" },
    orderBy: { createdAt: "asc" },
    include: {
      author: { select: { id: true, name: true, username: true, image: true } },
    },
  });
}

export async function countComments(articleId: string) {
  return db.comment.count({ where: { articleId, status: "APPROVED" } });
}
