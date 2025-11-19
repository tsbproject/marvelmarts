import Credentials from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import { prisma } from "@/app/_lib/prisma";
import { verifyPassword } from "@/app/_lib/password";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Fetch user via Prisma
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) return null;

        // Validate password
        const valid = await verifyPassword(
          credentials.password,
          user.passwordHash
        );

        if (!valid) return null;

        return {
          id: user.id,
          name: user.name ?? null,
          email: user.email ?? null,
          image: user.image ?? null,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) token.userId = (user as any).id;
      return token;
    },

    async session({ session, token }) {
      if (session.user && token.userId) {
        (session.user as any).id = token.userId;
      }
      return session;
    },
  },

  pages: {},
};






// import Credentials from "next-auth/providers/credentials";
// import type { NextAuthOptions } from "next-auth";
// import { supabase } from "@/app/_lib/db";
// import { verifyPassword } from "@/app/_lib/password";

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

//         const { data: users, error } = await supabase
//           .from("users")
//           .select("*")
//           .eq("email", credentials.email)
//           .limit(1);

//         if (error || !users || users.length === 0) return null;

//         const user = users[0];
//         if (!user.passwordHash) return null;

//         const ok = await verifyPassword(credentials.password, user.passwordHash);
//         return ok
//           ? {
//               id: user.id,
//               name: user.name ?? null,
//               email: user.email ?? null,
//               image: user.image ?? null,
//             }
//           : null;
//       },
//     }),
//   ],
//   pages: {},
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) token.userId = (user as any).id;
//       return token;
//     },
//     async session({ session, token }) {
//       if (session.user && token.userId) (session.user as any).id = token.userId;
//       return session;
//     },
//   },
// };