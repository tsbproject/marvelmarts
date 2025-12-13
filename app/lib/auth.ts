// app/lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs"; // ✅ match registration hashing library

export type UnifiedRole = "SUPER_ADMIN" | "ADMIN" | "VENDOR" | "CUSTOMER";

interface AuthUser {
  id: string;
  name: string | null;
  email: string;
  role: UnifiedRole;
  permissions: Record<string, boolean>;
}

import type { Session } from "next-auth";

export type SessionWithUserId = Session & {
  user: {
    id: string;
    email: string;
    role: UnifiedRole;
    permissions: Record<string, boolean>;
    name?: string | null;
  };
};


export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },

  pages: {
    signIn: "/auth/sign-in",
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<AuthUser | null> {
        if (!credentials?.identifier || !credentials.password) return null;
        const email = credentials.identifier.toLowerCase().trim();

        // 🔎 Fetch user once
        const user = await prisma.user.findUnique({
          where: { email },
          include: { vendorProfile: true },
        });

        if (!user) return null;

        // ✅ Compare password using bcryptjs
        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        // ✅ Type-safe permissions fallback
        const permissions =
          typeof user.permissions === "object" && user.permissions !== null
            ? (user.permissions as Record<string, boolean>)
            : {};

        // ✅ Return unified AuthUser object
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as UnifiedRole,
          permissions,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = user.role;
        token.permissions =
          typeof user.permissions === "object" && user.permissions !== null
            ? (user.permissions as Record<string, boolean>)
            : {};
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.role = token.role as UnifiedRole;
        session.user.permissions = token.permissions as Record<string, boolean>;
      }
      return session;
    },

    redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return baseUrl + url;
      try {
        return new URL(url).toString();
      } catch {
        return baseUrl;
      }
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
