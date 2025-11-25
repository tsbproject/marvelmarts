import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma  from "@/app/_lib/prisma";
import { verifyPassword } from "@/app/_lib/password";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },

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

        const valid = await verifyPassword(credentials.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: String(user.id), // Cast numeric DB id to string
          name: user.name ?? null,
          email: user.email ?? null,
          image: user.image ?? null,
          role: user.role ?? undefined,
        };
      },
    }),
  ],

  callbacks: {
    // jwt callback
    async jwt({ token, user }) {
      if (user) {
        // Store user id as string and role in the token
        token.id = String(user.id); // Convert the ID to string
        token.role = user.role; // Attach role
      }
      return token;
    },

    // session callback
    async session({ session, token }) {
      if (session.user) {
        // Attach token values (id, role) to the session's user object
        session.user.id = token.id as string;
        session.user.role = token.role;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/sign-in", // Custom sign-in page
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
