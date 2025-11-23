// import Credentials from "next-auth/providers/credentials";
// import type { NextAuthOptions, Session, User, JWT } from "next-auth";
// import { prisma } from "@/app/_lib/prisma";
// import { verifyPassword } from "@/app/_lib/password";

// // -------------------------
// // Extend JWT & Session types
// // -------------------------
// interface TokenWithUserId extends JWT {
//   userId?: number;
// }

// interface SessionWithUserId extends Session {
//   user?: {
//     id: number;
//     name?: string | null;
//     email?: string | null;
//     image?: string | null;
//   };
// }

// export const authOptions: NextAuthOptions = {
//   session: { strategy: "jwt" },

//   providers: [
//     Credentials({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },

//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) return null;

//         // Fetch user via Prisma
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
//     // Attach user ID to JWT
//     async jwt({ token, user }) {
//       const t = token as TokenWithUserId;
//       if (user) t.userId = (user as User & { id: number }).id;
//       return t;
//     },

//     // Add user ID to session
//     async session({ session, token }) {
//       const s = session as SessionWithUserId;
//       const t = token as TokenWithUserId;
//       if (s.user && t.userId) s.user.id = t.userId;
//       return s;
//     },
//   },

//   pages: {
//     signIn: "/auth/sign-in",
//   },
// };



// app/_lib/auth.ts
import { getServerSession as nextGetServerSession } from "next-auth/next";
import type { NextAuthOptions } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getServerSession() {
  // wrapper that forwards to next-auth/next implementation
  return nextGetServerSession(authOptions as NextAuthOptions);
}

