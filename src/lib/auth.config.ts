import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as { id?: string; role?: "ADMIN" | "AUTHOR" | "GUEST"; status?: "PENDING" | "ACTIVE" | "BANNED" };
        token.id = u.id;
        token.role = u.role ?? "GUEST";
        token.status = u.status ?? "ACTIVE";
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "AUTHOR" | "GUEST";
        session.user.status = token.status as "PENDING" | "ACTIVE" | "BANNED";
      }
      return session;
    },
    authorized({ request, auth }) {
      const url = new URL(request.url);
      const path = url.pathname;
      const isAdmin = path.startsWith("/admin");
      const isApi = path.startsWith("/api");
      if (isAdmin) {
        if (!auth?.user) return false;
        const role = auth.user.role;
        if (role !== "ADMIN" && role !== "AUTHOR") return false;
        if (auth.user.status !== "ACTIVE") return false;
        return true;
      }
      void isApi;
      return true;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
