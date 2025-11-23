import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/app/_lib/prisma";
import { verifyPassword } from "@/app/_lib/password";
import { JWT } from "next-auth/jwt"; // Import JWT type from next-auth

// Extend JWT with custom fields
interface TokenWithUserId extends JWT {
  userId?: string; // Add userId field to the JWT token
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt", // Use JWT-based session
  },

  pages: {
    signIn: "/auth/sign-in", // Custom sign-in page
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
          id: String(user.id), // Ensure ID is a string
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],

  callbacks: {
    // jwt callback
    async jwt({ token, user }) {
      const t = token as TokenWithUserId; // Cast token to TokenWithUserId

      if (user) {
        t.userId = String(user.id); // Attach userId as string
      }

      return t; // Return the modified token
    },

    // session callback
    async session({ session, token }) {
      const s = session;
      const t = token as TokenWithUserId;

      if (s.user && t.userId) {
        s.user.id = t.userId; // Attach userId to session's user object
      }

      return s; // Return the session
    },
  },

  secret: process.env.NEXTAUTH_SECRET, // Secret for encryption
};
