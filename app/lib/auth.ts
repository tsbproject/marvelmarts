// import NextAuth, { type NextAuthOptions, type DefaultSession, type DefaultUser } from "next-auth";
// import "next-auth/jwt";
// import CredentialsProvider from "next-auth/providers/credentials";
// import GoogleProvider from "next-auth/providers/google";
// import FacebookProvider from "next-auth/providers/facebook";
// import { prisma } from "@/app/lib/prisma";
// import bcrypt from "bcryptjs";
// import { UserRole, VendorStatus } from "@prisma/client";

// /* --- 1. Constants & Defaults --- */
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
//   manageVendors: false,
// };

// /* --- 2. Module Augmentation --- */
// declare module "next-auth" {
//   interface Session {
//     user: {
//       id: string;
//       role: UserRole;
//       permissions: Record<string, boolean>;
//       vendorStatus?: VendorStatus;
//       rejectionReason?: string | null;
//     } & DefaultSession["user"];
//   }

//   interface User extends DefaultUser {
//     id: string;
//     role: UserRole;
//     permissions: Record<string, boolean>;
//     vendorStatus?: VendorStatus;
//     rejectionReason?: string | null;
//   }
// }

// declare module "next-auth/jwt" {
//   interface JWT {
//     userId: string;    
//     role: UserRole;     
//     permissions: Record<string, boolean>; 
//     vendorStatus?: VendorStatus;
//     rejectionReason?: string | null;
//   }
// }

// interface AuthUser {
//   id: string;
//   name: string | null;
//   email: string;
//   role: UserRole;
//   permissions: Record<string, boolean>;
//   vendorStatus?: VendorStatus;
//   rejectionReason?: string | null;
// }

// /* --- 3. Helper Functions --- */
// function normalizePermissions(userPerms: any, profilePerms: any): Record<string, boolean> {
//   const base = { ...DEFAULT_PERMISSIONS };
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
//     error: "/auth/error",
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
//             include: { 
//               adminProfile: true,
//               vendorProfile: {
//                 select: {
//                   status: true,
//                   rejectionReason: true
//                 }
//               }
//             },
//           });

//           if (!user?.passwordHash) return null;

//           const isValid = await bcrypt.compare(password, user.passwordHash);
//           if (!isValid) return null;

//           // Compute permissions
//           const permissions = normalizePermissions(
//             user.permissions, 
//             user.adminProfile?.permissions
//           );

//           return {
//             id: user.id,
//             name: user.name,
//             email: user.email,
//             role: user.role,
//             permissions,
//             vendorStatus: user.vendorProfile?.status,
//             rejectionReason: user.vendorProfile?.rejectionReason,
//           };
//         } catch (error) {
//           console.error("Auth error:", error);
//           return null;
//         }
//       },
//     }),
//   ],

//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.userId = user.id;
//         token.role = user.role;
//         token.permissions = user.permissions;
//         token.vendorStatus = user.vendorStatus;
//         token.rejectionReason = user.rejectionReason;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       if (token && session.user) {
//         session.user.id = token.userId;
//         session.user.role = token.role;
//         session.user.permissions = token.permissions;
//         session.user.vendorStatus = token.vendorStatus;
//         session.user.rejectionReason = token.rejectionReason;
//       }
//       return session;
//     },
//   },
// };

// export default NextAuth(authOptions);




import NextAuth, { type NextAuthOptions, type DefaultSession, type DefaultUser } from "next-auth";
import "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";
import { UserRole, VendorStatus } from "@prisma/client";

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
  manageVendors: false,
};

/* --- 2. Module Augmentation --- */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      permissions: Record<string, boolean>;
      vendorStatus?: VendorStatus;
      rejectionReason?: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    role: UserRole;
    permissions: Record<string, boolean>;
    vendorStatus?: VendorStatus;
    rejectionReason?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;    
    role: UserRole;     
    permissions: Record<string, boolean>; 
    vendorStatus?: VendorStatus;
    rejectionReason?: string | null;
  }
}

interface AuthUser {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  permissions: Record<string, boolean>;
  vendorStatus?: VendorStatus;
  rejectionReason?: string | null;
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
            include: { 
              adminProfile: true,
              vendorProfile: {
                select: {
                  status: true,
                  rejectionReason: true
                }
              }
            },
          });

          if (!user?.passwordHash) return null;

          const isValid = await bcrypt.compare(password, user.passwordHash);
          if (!isValid) return null;

          const permissions = normalizePermissions(
            user.permissions, 
            user.adminProfile?.permissions
          );

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            permissions,
            vendorStatus: user.vendorProfile?.status,
            rejectionReason: user.vendorProfile?.rejectionReason,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // 1. Initial Sign In
      if (user) {
        token.userId = user.id;
        token.role = user.role;
        token.permissions = user.permissions;
        token.vendorStatus = user.vendorStatus;
        token.rejectionReason = user.rejectionReason;
      }

      // 2. Role Sync: If a Customer becomes a Vendor, we must fetch the new role from DB
      // We check the DB whenever a session is accessed to ensure role upgrades are instant.
      if (!user && token.userId) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.userId },
          select: { 
            role: true, 
            permissions: true,
            vendorProfile: {
              select: { status: true, rejectionReason: true }
            }
          }
        });

        if (dbUser) {
          token.role = dbUser.role;
          token.vendorStatus = dbUser.vendorProfile?.status;
          token.rejectionReason = dbUser.vendorProfile?.rejectionReason;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.userId;
        session.user.role = token.role;
        session.user.permissions = token.permissions;
        session.user.vendorStatus = token.vendorStatus;
        session.user.rejectionReason = token.rejectionReason;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
