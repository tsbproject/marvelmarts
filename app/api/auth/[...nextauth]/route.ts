// app/api/auth/[...nextauth]/route.ts

import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/app/_lib/prisma";
import { compare } from "bcryptjs";

// -------------------------
// Custom Session User type
// -------------------------
interface SessionUser {
  id: number;
  name?: string | null;
  email?: string | null;
}

// -------------------------
// NextAuth Options
// -------------------------
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

        // Fetch user from Prisma
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) return null;

        // Validate password
        const valid = await compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as SessionUser).id;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as SessionUser).id = token.id;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

// -------------------------
// Export NextAuth handler
// -------------------------
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
