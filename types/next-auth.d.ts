import { DefaultSession } from "next-auth";

type Role = "SUPER_ADMIN" | "ADMIN" | "VENDOR" | "USER";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      permissions?: Record<string, boolean> | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    name: string | null;
    email: string | null;
    image?: string | null;
    role: Role;
    permissions?: Record<string, boolean> | null;
    passwordHash?: string; // optional for auth logic
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    role: Role;
    permissions?: Record<string, boolean> | null;
  }
}
