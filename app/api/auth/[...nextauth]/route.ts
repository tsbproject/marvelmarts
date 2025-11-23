// import NextAuth, { NextAuthOptions } from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import { prisma } from "@/app/_lib/prisma";
// import { verifyPassword } from "@/app/_lib/password";
// import type { JWT } from "next-auth/jwt";
// import type { Session, User } from "next-auth";

// interface TokenWithUserId extends JWT {
//   userId?: number;
// }

// interface SessionWithUserId extends Session {
//   user: {
//     id: number;
//     name?: string | null;
//     email?: string | null;
//     image?: string | null;
//   };
// }

// export const authOptions: NextAuthOptions = {
//   session: { strategy: "jwt" },

//   providers: [
//     CredentialsProvider({
//       name: "Credentials",

//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },

//       async authorize(credentials: Record<string, string> | undefined) {
//         if (!credentials?.email || !credentials?.password) return null;

//         const user = await prisma.user.findUnique({
//           where: { email: credentials.email },
//         });

//         if (!user || !user.passwordHash) return null;

//         const valid = await verifyPassword(credentials.password, user.passwordHash);
//         if (!valid) return null;

//         return {
//           id: user.id,
//           name: user.name ?? null,
//           email: user.email ?? null,
//           image: user.image ?? null,
//         };
//       },
//     }),
//   ],

//   callbacks: {
//     async jwt({ token, user }) {
//       const t = token as TokenWithUserId;

//       if (user) {
//         t.userId = (user as User & { id: number }).id;
//       }

//       return t;
//     },

//     async session({ session, token }) {
//       const s = session as SessionWithUserId;
//       const t = token as TokenWithUserId;

//       s.user = {
//         id: t.userId ?? 0,
//         name: session.user?.name ?? null,
//         email: session.user?.email ?? null,
//         image: session.user?.image ?? null,
//       };

//       return s;
//     },
//   },

//   pages: {
//     signIn: "/auth/sign-in",
//   },
// };

// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };


import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/app/_lib/prisma";
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
          id: String(user.id), // ✅ cast numeric DB id to string
          name: user.name ?? null,
          email: user.email ?? null,
          image: user.image ?? null,
          role: user.role ?? undefined,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = String(user.id); // ✅ attach id as string
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/sign-in",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
