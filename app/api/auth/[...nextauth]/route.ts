import NextAuth, { type NextAuthOptions, type Session, type User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/app/_lib/prisma";
import { compare } from "bcryptjs";

// Define the token shape
interface JwtToken extends Record<string, unknown> {
  id?: number;
}

// Extend session user
interface SessionUser extends Session["user"] {
  id: number;
}

// ---------------------------
// NextAuth options
// ---------------------------
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
        if (!credentials?.email || !credentials.password) return null;

        // Fetch user from Prisma
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) return null;

        const isValid = await compare(credentials.password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
        } as User;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as User & { id: number }).id;
      }
      return token as JwtToken;
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

// ---------------------------
// Export for Next.js route
// ---------------------------
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
