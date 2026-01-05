import { DefaultSession } from "next-auth";
import { UserRole } from "@prisma/client"; //use Prisma enum directly

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole; //use Prisma UserRole
      permissions: Record<string, boolean>;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    name: string | null;
    email: string | null;
    image?: string | null;
    role: UserRole; //use Prisma UserRole
    permissions: Record<string, boolean>;
    passwordHash?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    role: UserRole; //use Prisma UserRole
    permissions: Record<string, boolean>;
  }
}
