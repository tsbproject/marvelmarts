import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcrypt";
import type { JWT } from "next-auth/jwt";
import type { Session, User } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash || ""
        );

        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
   async jwt({ token, user }): Promise<JWT> {
  if (user) {
    token.id = user.id;
    token.role = (user as User).role;
  }
  return token;
},


    async session({ session, token }): Promise<Session> {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },

    async redirect({
      url,
      baseUrl,
      token,
    }: {
      url: string;
      baseUrl: string;
      token?: JWT;
    }): Promise<string> {
      if (!token) return "/auth/sign-in";
      return token.role === "admin" ? "/admin" : "/account";
    },
  },

  pages: {
    signIn: "/auth/sign-in",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
