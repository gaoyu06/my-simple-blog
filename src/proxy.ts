import NextAuth from "next-auth";
import type { NextRequest } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth: authProxy } = NextAuth(authConfig);

export default function proxy(request: NextRequest) {
  return (authProxy as unknown as (req: NextRequest) => Response | Promise<Response>)(request);
}

export const config = {
  // Only the dashboard needs the auth gate; public pages stay static.
  matcher: ["/admin/:path*"],
};
