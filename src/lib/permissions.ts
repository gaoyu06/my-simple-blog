import type { Session } from "next-auth";

export type Role = "ADMIN" | "AUTHOR" | "GUEST";

export function isAdmin(session: Session | null): boolean {
  return session?.user?.role === "ADMIN";
}

export function isAuthorOrAbove(session: Session | null): boolean {
  const role = session?.user?.role;
  return role === "ADMIN" || role === "AUTHOR";
}

export function canManageSite(session: Session | null): boolean {
  return isAdmin(session);
}

export function canWriteArticles(session: Session | null): boolean {
  return isAuthorOrAbove(session) && session?.user?.status === "ACTIVE";
}

export function canEditArticle(
  session: Session | null,
  article: { authorId: string },
): boolean {
  if (!session?.user) return false;
  if (session.user.status !== "ACTIVE") return false;
  if (session.user.role === "ADMIN") return true;
  return session.user.role === "AUTHOR" && article.authorId === session.user.id;
}
