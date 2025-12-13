// types/next-auth.d.ts
import { DefaultSession } from "next-auth";

export type Role = "SUPER_ADMIN" | "ADMIN" | "VENDOR" | "CUSTOMER";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      permissions: Record<string, boolean>;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    name: string | null;
    email: string | null;
    image?: string | null;
    role: Role;
    permissions: Record<string, boolean>;
    passwordHash?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    role: Role;
    permissions: Record<string, boolean>;
  }
}
