import NextAuth from "next-auth";
import type { NextRequest } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth: authProxy } = NextAuth(authConfig);

export default function proxy(request: NextRequest) {
  return (authProxy as unknown as (req: NextRequest) => Response | Promise<Response>)(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
