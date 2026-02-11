



// import NextAuth, { type NextAuthOptions, type DefaultSession, type DefaultUser } from "next-auth";
// import "next-auth/jwt";
// import CredentialsProvider from "next-auth/providers/credentials";
// import GoogleProvider from "next-auth/providers/google";
// import FacebookProvider from "next-auth/providers/facebook";
// import { prisma } from "@/app/lib/prisma";
// import bcrypt from "bcryptjs";
// import { UserRole } from "@prisma/client";

// /* --- 1. Constants & Defaults --- */
// const DEFAULT_SOCIAL_ROLE: UserRole = "CUSTOMER";

// const DEFAULT_PERMISSIONS = {
//   manageAdmins: false,
//   manageUsers: false,
//   manageBlogs: false,
//   manageProducts: false,
//   manageOrders: false,
//   manageMessages: false,
//   manageSettings: false,
//   manageCategories: false,
//   manageReviews: false,
//   manageSupport: false,
//   manageActivity: false,
//   manageTrending: false,
//   manageSubscribers: false,
// };

// /* --- 2. Module Augmentation --- */
// declare module "next-auth" {
//   interface Session {
//     user: {
//       id: string;
//       role: UserRole;
//       permissions: Record<string, boolean>;
//     } & DefaultSession["user"];
//   }

//   interface User extends DefaultUser {
//     id: string;
//     role: UserRole;
//     permissions: Record<string, boolean>;
//   }
// }

// declare module "next-auth/jwt" {
//   interface JWT {
//     userId: string;    
//     role: UserRole;     
//     permissions: Record<string, boolean>; 
//   }
// }

// interface AuthUser {
//   id: string;
//   name: string | null;
//   email: string;
//   role: UserRole;
//   permissions: Record<string, boolean>;
// }

// /* --- 3. Helper Functions --- */
// function normalizePermissions(userPerms: any, profilePerms: any): Record<string, boolean> {
//   const base = { ...DEFAULT_PERMISSIONS };
//   // Prioritize AdminProfile permissions, fallback to User table permissions
//   const merged = { 
//     ...(typeof userPerms === "object" ? userPerms : {}),
//     ...(typeof profilePerms === "object" ? profilePerms : {})
//   };
  
//   return { ...base, ...merged };
// }

// /* --- 4. Auth Options --- */
// export const authOptions: NextAuthOptions = {
//   debug: false,
//   session: { strategy: "jwt" },
//   pages: {
//     signIn: "/auth/sign-in",
//   },

//   providers: [
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         identifier: { label: "Email", type: "text" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials): Promise<AuthUser | null> {
//         try {
//           const identifier = credentials?.identifier?.toLowerCase().trim();
//           const password = credentials?.password;
//           if (!identifier || !password) return null;

//           const user = await prisma.user.findUnique({
//             where: { email: identifier },
//             include: { adminProfile: true },
//           });

//           if (!user?.passwordHash) return null;

//           const isValid = await bcrypt.compare(password, user.passwordHash);
//           if (!isValid) return null;

//           return {
//             id: user.id,
//             name: user.name,
//             email: user.email,
//             role: user.role,
//             permissions: normalizePermissions(user.permissions, user.adminProfile?.permissions),
//           };
//         } catch (err) {
//           console.error("[Credentials authorize] error", err);
//           return null;
//         }
//       },
//     }),

//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     }),

//     FacebookProvider({
//       clientId: process.env.FACEBOOK_CLIENT_ID!,
//       clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
//     }),
//   ],

//   callbacks: {
//     async jwt({ token, user, trigger }) {
//       try {
//         // Initial Sign In
//         if (user) {
//           token.userId = user.id;
//           token.email = user.email?.toLowerCase();
//           token.role = user.role;
//           token.permissions = user.permissions;
//         }

//         // Always fetch fresh role/permissions on login or token refresh
//         // This solves the 401 issue if you changed your role in the DB
//         if (!token.role || trigger === "signIn" || trigger === "update") {
//           const dbUser = await prisma.user.findUnique({
//             where: { email: token.email as string },
//             include: { adminProfile: true },
//           });

//           if (dbUser) {
//             token.role = dbUser.role;
//             token.permissions = normalizePermissions(dbUser.permissions, dbUser.adminProfile?.permissions);
//           }
//         }

//         return token;
//       } catch (err) {
//         console.error("[JWT callback] error", err);
//         return token;
//       }
//     },

//     async session({ session, token }) {
//       try {
//         if (session.user) {
//           session.user.id = (token.userId as string);
//           session.user.role = (token.role as UserRole);
//           session.user.permissions = (token.permissions as Record<string, boolean>);
//         }
//         return session;
//       } catch (err) {
//         console.error("[Session callback] error", err);
//         return session;
//       }
//     },

//     redirect({ url, baseUrl }) {
//       if (url.startsWith("/")) return `${baseUrl}${url}`;
//       return url.startsWith(baseUrl) ? url : baseUrl;
//     },
//   },

//   secret: process.env.NEXTAUTH_SECRET,
// };





import NextAuth, { type NextAuthOptions, type DefaultSession, type DefaultUser } from "next-auth";
import "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";

/* --- 1. Constants & Defaults --- */
const DEFAULT_PERMISSIONS = {
  manageAdmins: false,
  manageUsers: false,
  manageBlogs: false,
  manageProducts: false,
  manageOrders: false,
  manageMessages: false,
  manageSettings: false,
  manageCategories: false,
  manageReviews: false,
  manageSupport: false,
  manageActivity: false,
  manageTrending: false,
  manageSubscribers: false,
};

/* --- 2. Module Augmentation --- */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      permissions: Record<string, boolean>;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    role: UserRole;
    permissions: Record<string, boolean>;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;    
    role: UserRole;     
    permissions: Record<string, boolean>; 
  }
}

interface AuthUser {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  permissions: Record<string, boolean>;
}

/* --- 3. Helper Functions --- */
function normalizePermissions(userPerms: any, profilePerms: any): Record<string, boolean> {
  const base = { ...DEFAULT_PERMISSIONS };
  const merged = { 
    ...(typeof userPerms === "object" ? userPerms : {}),
    ...(typeof profilePerms === "object" ? profilePerms : {})
  };
  return { ...base, ...merged };
}

/* --- 4. Auth Options --- */
export const authOptions: NextAuthOptions = {
  debug: false,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/sign-in",
    error: "/auth/error",
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<AuthUser | null> {
        try {
          const identifier = credentials?.identifier?.toLowerCase().trim();
          const password = credentials?.password;
          if (!identifier || !password) return null;

          const user = await prisma.user.findUnique({
            where: { email: identifier },
            include: { adminProfile: true },
          });

          if (!user?.passwordHash) return null;

          const isValid = await bcrypt.compare(password, user.passwordHash);
          if (!isValid) return null;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            permissions: normalizePermissions(user.permissions, user.adminProfile?.permissions),
          };
        } catch (err) {
          console.error("[Credentials authorize] error", err);
          return null;
        }
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      try {
        // 1. Handle Initial Sign In
        if (user) {
          token.userId = user.id;
          token.email = user.email?.toLowerCase();
          token.role = user.role;
          token.permissions = user.permissions;
        }

        // 2. Handle Manual Updates (Triggered by update() from useSession)
        if (trigger === "update" && session) {
          token.role = session.role || token.role;
          token.permissions = session.permissions || token.permissions;
        }

        // 3. Ensure token is always populated with DB data if something is missing
        if (!token.role) {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string },
            include: { adminProfile: true },
          });

          if (dbUser) {
            token.role = dbUser.role;
            token.permissions = normalizePermissions(dbUser.permissions, dbUser.adminProfile?.permissions);
          }
        }

        return token;
      } catch (err) {
        console.error("[JWT callback] error", err);
        return token;
      }
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.userId;
        session.user.role = token.role;
        session.user.permissions = token.permissions;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
