// import NextAuth from "next-auth";
// import Credentials from "next-auth/providers/credentials";
// import  prisma  from "@/app/lib/prisma";
// import bcrypt from "bcrypt";



// export const authOptions = {
//   providers: [
//     Credentials({
//       name: "Credentials",
//       credentials: {
//         email: {},
//         password: {}
//       },

//       async authorize(credentials) {
//         if (!credentials) return null;
//         const { email, password } = credentials as { email?: string; password?: string };

//         if (!email || !password) return null;

//         // Find user
//         const user = await prisma.user.findUnique({
//           where: { email }
//         });

//         if (!user) return null;

//         // Validate password
//         const isValid = await bcrypt.compare(password, user.passwordHash ?? "");
//         if (!isValid) return null;

//         return {
//           id: user.id,
//           name: user.name,
//           email: user.email,
//           role: user.role, // include role
//         };
//       }
//     })
//   ],

//   session: {
//     strategy: "jwt",
//   },

//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.role = user.role;
//       }
//       return token;
//     },

//     async session({ session, token }) {
//       if (token) {
//         session.user.role = token.role;
//       }
//       return session;
//     },

//     async redirect({ url, baseUrl, token }) {
//       if (!token) return "/auth/sign-in";

//       // Role redirects
//       if (token.role === "admin") return "/admin";

//       return "/account";
//     }
//   },

//   pages: {
//     signIn: "/auth/sign-in",
//   }
// };

// const handler = NextAuth(authOptions);

// export { handler as GET, handler as POST };


import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcrypt";
import type { JWT } from "next-auth/jwt";
import type { User, Session } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials) return null;
        const { email, password } = credentials as {
          email?: string;
          password?: string;
        };

        if (!email || !password) return null;

        // Find user in DB
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) return null;

        // Validate password
        const isValid = await bcrypt.compare(password, user.passwordHash ?? "");
        if (!isValid) return null;

        // Return user object with role
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
    async jwt({
      token,
      user,
    }: {
      token: JWT;
      user?: User;
    }): Promise<JWT> {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },

    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT;
    }): Promise<Session> {
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

      // Role-based redirects
      if (token.role === "admin") return "/admin";

      return "/account";
    },
  },

  pages: {
    signIn: "/auth/sign-in",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
