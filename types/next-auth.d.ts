import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string; // ✅ keep as string (NextAuth expects string)
      name?: string | null;
      email?: string | null;
      image?: string | null; // ✅ include image if you use it
      role?: string;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  }

  interface JWT {
    id?: string;
    role?: string;
  }
}