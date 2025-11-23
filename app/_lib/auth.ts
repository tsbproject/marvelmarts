// app/_lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/app/_lib/prisma";
import { verifyPassword } from "@/app/_lib/password";

// Extend JWT
interface TokenWithUserId {
  userId?: string;
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

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) return null;

        const valid = await verifyPassword(
          credentials.password,
          user.passwordHash
        );
        if (!valid) return null;

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      const t = token as TokenWithUserId;

      if (user) {
        t.userId = String(user.id);
      }

      return t;
    },

    async session({ session, token }) {
      const s = session;
      const t = token as TokenWithUserId;

      if (s.user && t.userId) {
        s.user.id = t.userId; // ensure string
      }

      return s;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
