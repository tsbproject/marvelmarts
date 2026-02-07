// // import type { NextAuthOptions, Session } from "next-auth";
// // import CredentialsProvider from "next-auth/providers/credentials";
// // import GoogleProvider from "next-auth/providers/google";
// // import FacebookProvider from "next-auth/providers/facebook";
// // import { prisma } from "@/app/lib/prisma";
// // import bcrypt from "bcryptjs";
// // import { UserRole } from "@prisma/client";

// // export type Role = "SUPER_ADMIN" | "ADMIN" | "VENDOR" | "CUSTOMER";

// // declare module "next-auth" {
// //   interface Session {
// //     user: {
// //       id: string;
// //       email: string;
// //       role: UserRole;
// //       permissions: Record<string, boolean>;
// //       name?: string | null;
// //     };
// //   }
// // }

// // interface AuthUser {
// //   id: string;
// //   name: string | null;
// //   email: string;
// //   role: UserRole;
// //   permissions: Record<string, boolean>;
// // }

// // declare module "next-auth" {
// //   interface Session {
// //     user: {
// //       id: string;
// //       email: string;
// //       role: UserRole;
// //       permissions: Record<string, boolean>;
// //       name?: string | null;
// //     };
// //   }
// // }


// // const DEFAULT_SOCIAL_ROLE: UserRole = "CUSTOMER";

// // function normalizePermissions(value: unknown): Record<string, boolean> {
// //   return typeof value === "object" && value !== null
// //     ? (value as Record<string, boolean>)
// //     : {};
// // }

// // export const authOptions: NextAuthOptions = {
// //   debug: false,
// //   session: { strategy: "jwt" },
// //   pages: {
// //     signIn: "/auth/sign-in",
// //   },

// //   providers: [
// //     CredentialsProvider({
// //       name: "Credentials",
// //       credentials: {
// //         identifier: { label: "Email", type: "text" },
// //         password: { label: "Password", type: "password" },
// //       },
// //       async authorize(credentials): Promise<AuthUser | null> {
// //         try {
// //           const identifier = credentials?.identifier?.toLowerCase().trim();
// //           const password = credentials?.password;
// //           if (!identifier || !password) return null;

// //           const user = await prisma.user.findUnique({
// //             where: { email: identifier },
// //             include: { adminProfile: true, vendorProfile: true },
// //           });
// //           if (!user?.passwordHash) return null;

// //           const isValid = await bcrypt.compare(password, user.passwordHash);
// //           if (!isValid) return null;

// //           return {
// //             id: user.id,
// //             name: user.name,
// //             email: user.email,
// //             role: user.role as UserRole,
// //             permissions: normalizePermissions(user.adminProfile?.permissions),
// //           };
// //         } catch (err) {
// //           console.error("[Credentials authorize] error", err);
// //           return null;
// //         }
// //       },
// //     }),

// //     GoogleProvider({
// //       clientId: process.env.GOOGLE_CLIENT_ID!,
// //       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
// //     }),

// //     FacebookProvider({
// //       clientId: process.env.FACEBOOK_CLIENT_ID!,
// //       clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
// //     }),
// //   ],

// //   callbacks: {
// //     async jwt({ token, user, account }) {
// //       try {
// //         console.log("[JWT callback] start", { token, user, account });

// //         const isOAuth = !!account && !!user;
// //         const email = user?.email?.toLowerCase();

// //         if (isOAuth && email) {
// //           let dbUser = await prisma.user.findUnique({
// //             where: { email },
// //             include: { adminProfile: true },
// //           });

// //           if (!dbUser) {
// //             console.log("[JWT callback] creating new OAuth user", email);
// //             dbUser = await prisma.user.create({
// //               data: {
// //                 email,
// //                 name: user.name,
// //                 role: DEFAULT_SOCIAL_ROLE,
// //                 adminProfile: { create: { permissions: {} } },
// //               },
// //               include: { adminProfile: true },
// //             });
// //           }

// //           token.userId = dbUser.id;
// //           token.email = dbUser.email;
// //           token.role = dbUser.role;
// //           token.permissions = normalizePermissions(dbUser.adminProfile?.permissions);
// //         }

// //         if (!isOAuth && user) {
// //           console.log("[JWT callback] credentials user", user.email);
// //           token.userId = user.id;
// //           token.email = user.email;
// //           token.role = user.role as UserRole;
// //           token.permissions = normalizePermissions(user.permissions);
// //         }

// //         console.log("[JWT callback] final token", token);
// //         return token;
// //       } catch (err) {
// //         console.error("[JWT callback] error", err);
// //         return token;
// //       }
// //     },

// //     async session({ session, token }) {
// //       try {
// //         console.log("[Session callback] start", { session, token });
// //         if (session.user) {
// //           session.user.id = token.userId ?? "";
// //           session.user.email = token.email ?? "";
// //           session.user.role = token.role ?? UserRole.CUSTOMER;
// //           session.user.permissions = token.permissions ?? {};
// //         }
// //         console.log("[Session callback] final session", session);
// //         return session;
// //       } catch (err) {
// //         console.error("[Session callback] error", err);
// //         return session;
// //       }
// //     },

// //     redirect({ url, baseUrl }) {
// //       if (url.startsWith("/")) return baseUrl + url;
// //       try {
// //         return new URL(url).toString();
// //       } catch {
// //         return baseUrl;
// //       }
// //     },
// //   },

// //   secret: process.env.NEXTAUTH_SECRET,
// // };




import NextAuth, { type NextAuthOptions, type DefaultSession, type DefaultUser } from "next-auth";
import "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";

export type Role = "SUPER_ADMIN" | "ADMIN" | "VENDOR" | "CUSTOMER";

/* --- 1. Constants & Defaults --- */
const DEFAULT_SOCIAL_ROLE: UserRole = "CUSTOMER";

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
function normalizePermissions(value: unknown): Record<string, boolean> {
  const base = { ...DEFAULT_PERMISSIONS };
  if (typeof value === "object" && value !== null) {
    return { ...base, ...(value as Record<string, boolean>) };
  }
  return base;
}

/* --- 4. Auth Options --- */
export const authOptions: NextAuthOptions = {
  debug: false,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/sign-in",
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
            include: { adminProfile: true, vendorProfile: true },
          });

          if (!user?.passwordHash) return null;

          const isValid = await bcrypt.compare(password, user.passwordHash);
          if (!isValid) return null;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role as UserRole,
            permissions: normalizePermissions(user.adminProfile?.permissions),
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
    async jwt({ token, user, account }) {
      try {
        // Initial Sign In (Credentials or OAuth)
        if (user) {
          token.userId = user.id;
          token.email = user.email?.toLowerCase();
          token.role = user.role as UserRole;
          token.permissions = user.permissions || {};
        }

        // Fetch/Refresh permissions from DB if it's an OAuth user or if permissions are missing
        // This ensures permissions are synced even if changed in the DB after login
        if (!token.permissions || Object.keys(token.permissions).length === 0 || !!account) {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string },
            include: { adminProfile: true },
          });

          if (dbUser) {
            token.role = dbUser.role;
            token.permissions = normalizePermissions(dbUser.adminProfile?.permissions);
          } else if (!!account && token.email) {
            // Logic for first-time OAuth user creation (if not handled elsewhere)
            const newUser = await prisma.user.create({
              data: {
                email: token.email,
                name: token.name,
                role: DEFAULT_SOCIAL_ROLE,
                adminProfile: { create: { permissions: {} } },
              },
              include: { adminProfile: true },
            });
            token.userId = newUser.id;
            token.role = newUser.role;
            token.permissions = normalizePermissions(newUser.adminProfile?.permissions);
          }
        }

        return token;
      } catch (err) {
        console.error("[JWT callback] error", err);
        return token;
      }
    },

    async session({ session, token }) {
      try {
        if (session.user) {
          session.user.id = (token.userId as string) ?? "";
          session.user.email = (token.email as string) ?? "";
          session.user.role = (token.role as UserRole) ?? UserRole.CUSTOMER;
          session.user.permissions = (token.permissions as Record<string, boolean>) ?? {};
        }
        return session;
      } catch (err) {
        console.error("[Session callback] error", err);
        return session;
      }
    },

    redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return baseUrl + url;
      try {
        return new URL(url).toString();
      } catch {
        return baseUrl;
      }
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};





