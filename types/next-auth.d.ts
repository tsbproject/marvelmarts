import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string | null;
      permissions?: Record<string, boolean>;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    name: string | null;
    email: string | null;
    image?: string | null;
    role: string | null;
    permissions?: Record<string, boolean>;
    passwordHash: string;  // required to fix "user.passwordHash" error
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    role: string | null;
    permissions?: Record<string, boolean>;
  }
}
