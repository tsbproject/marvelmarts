// types/next-auth.d.ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;        // always present
      role?: string;     // role stored on JWT
      permissions?: Record<string, boolean>;
    } & DefaultSession["user"]; // merge default fields (name, email, image)
  }

  interface User {
    id: string;
    role?: string;
    permissions?: Record<string, boolean> | null;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;     // persisted user ID
    role?: string;   // persisted role
    permissions?: Record<string, boolean>;
  }
}
