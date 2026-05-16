"use server";

import { z } from "zod";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getCommentPolicy } from "@/server/queries/site";
import { sanitizeCommentHtml } from "@/lib/html-sanitize";
import { renderMarkdown } from "@/lib/markdown";

const createSchema = z.object({
  articleId: z.string().min(1),
  parentId: z.string().optional().nullable(),
  content: z.string().min(1, "Comment cannot be empty.").max(4000),
  authorName: z.string().min(1).max(80).optional(),
  authorEmail: z.string().email().optional(),
  authorWebsite: z.string().url().optional().or(z.literal("").transform(() => undefined)),
  honeypot: z.string().optional(),
});

export type CommentResult =
  | { ok: true; commentId: string; pending: boolean }
  | { ok: false; error: string; fields?: Record<string, string> };

async function fingerprint(): Promise<{ ipHash: string | null; userAgent: string | null }> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0]?.trim() || h.get("x-real-ip") || "";
  const ua = h.get("user-agent") ?? "";
  const ipHash = ip
    ? createHash("sha256")
        .update(ip + (process.env.AUTH_SECRET ?? "salt"))
        .digest("hex")
        .slice(0, 32)
    : null;
  return { ipHash, userAgent: ua || null };
}

export async function postComment(input: unknown): Promise<CommentResult> {
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) fields[issue.path.join(".")] = issue.message;
    return { ok: false, error: "Validation failed.", fields };
  }
  const data = parsed.data;
  if (data.honeypot) return { ok: false, error: "Submission blocked." };

  const article = await db.article.findUnique({ where: { id: data.articleId } });
  if (!article || article.status !== "PUBLISHED") return { ok: false, error: "Article not found." };
  if (!article.allowComment) return { ok: false, error: "Comments are closed." };

  const session = await auth();
  const policy = await getCommentPolicy();

  if (!session?.user && !policy.allowAnonymous) {
    return { ok: false, error: "Sign in to comment." };
  }

  if (!session?.user) {
    if (!data.authorName || !data.authorEmail) {
      return {
        ok: false,
        error: "Name and email required for guest comments.",
        fields: {
          authorName: data.authorName ? "" : "Required",
          authorEmail: data.authorEmail ? "" : "Required",
        },
      };
    }
  }

  if (data.parentId) {
    const parent = await db.comment.findUnique({ where: { id: data.parentId } });
    if (!parent || parent.articleId !== data.articleId) {
      return { ok: false, error: "Parent comment not found." };
    }
  }

  const { ipHash, userAgent } = await fingerprint();

  const needsApproval = policy.needsApproval && session?.user?.role !== "ADMIN";

  const html = await renderMarkdown(data.content);
  const safeHtml = sanitizeCommentHtml(html);

  const comment = await db.comment.create({
    data: {
      articleId: data.articleId,
      parentId: data.parentId ?? null,
      authorId: session?.user?.id ?? null,
      authorName: session?.user?.name ?? data.authorName ?? null,
      authorEmail: session?.user?.email ?? data.authorEmail ?? null,
      authorWebsite: data.authorWebsite ?? null,
      content: data.content,
      contentHtml: safeHtml,
      status: needsApproval ? "PENDING" : "APPROVED",
      ipHash,
      userAgent,
    },
  });

  revalidatePath(`/articles/${article.slug}`);
  return { ok: true, commentId: comment.id, pending: needsApproval };
}

export async function deleteComment(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Not authorized." };
  const comment = await db.comment.findUnique({
    where: { id },
    include: { article: { select: { slug: true, authorId: true } } },
  });
  if (!comment) return { ok: false, error: "Comment not found." };
  const isOwner = session.user.id === comment.authorId;
  const isPostAuthor = session.user.id === comment.article.authorId;
  const isAdmin = session.user.role === "ADMIN";
  if (!isOwner && !isPostAuthor && !isAdmin) {
    return { ok: false, error: "Not authorized." };
  }
  await db.comment.delete({ where: { id } });
  revalidatePath(`/articles/${comment.article.slug}`);
  return { ok: true };
}

export async function moderateComment(
  id: string,
  status: "APPROVED" | "PENDING" | "SPAM" | "TRASH",
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Not authorized." };
  const comment = await db.comment.findUnique({
    where: { id },
    include: { article: { select: { slug: true, authorId: true } } },
  });
  if (!comment) return { ok: false, error: "Comment not found." };
  const isAdmin = session.user.role === "ADMIN";
  const isPostAuthor = session.user.id === comment.article.authorId;
  if (!isAdmin && !isPostAuthor) return { ok: false, error: "Not authorized." };
  await db.comment.update({ where: { id }, data: { status } });
  revalidatePath(`/articles/${comment.article.slug}`);
  return { ok: true };
}
