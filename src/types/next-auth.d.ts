import type { DefaultSession } from "next-auth";
import type { JWT as DefaultJWT } from "next-auth/jwt";

type Role = "ADMIN" | "AUTHOR" | "GUEST";
type Status = "PENDING" | "ACTIVE" | "BANNED";

declare module "next-auth" {
  interface User {
    role?: Role;
    status?: Status;
  }
  interface Session {
    user: {
      id: string;
      role: Role;
      status: Status;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    role?: Role;
    status?: Status;
  }
}
