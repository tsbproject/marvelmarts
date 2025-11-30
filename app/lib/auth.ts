// lib/auth.ts
import type { NextAuthOptions, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcrypt";
import { JWT } from "next-auth/jwt";

interface TokenWithUserId extends JWT {
  userId?: string;
  role?: string;
}

export interface SessionWithUserId extends Session {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  };
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/auth/sign-in",
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const user = await prisma.admin.findUnique({
            where: { email: credentials.email },
          });
          if (!user) return null;

          const valid = await bcrypt.compare(credentials.password, user.password);
          if (!valid) return null;

          return {
            id: String(user.id),
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (err) {
          console.error("Authorize error:", err);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    // 🔐 Save role & user ID inside JWT
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          userId: String(user.id),
          role: (user as any).role,
        };
      }
      return token;
    },

    // 🔄 Expose JWT fields inside session.user
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token as TokenWithUserId)?.userId ?? session.user.id;
        session.user.role = (token as TokenWithUserId)?.role ?? session.user.role;
      }
      return session;
    },

  
redirect() {
  // Always go to redirect-handler; role-based routing happens there
  return "/auth/redirect-handler";
}

  },

  secret: process.env.NEXTAUTH_SECRET,
};
