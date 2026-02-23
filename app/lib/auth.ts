// import NextAuth, { type NextAuthOptions, type DefaultSession, type DefaultUser } from "next-auth";
// import "next-auth/jwt";
// import CredentialsProvider from "next-auth/providers/credentials";
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
//   manageVerifications: false,
// };

// /* --- 2. Module Augmentation --- */
// declare module "next-auth" {
//   interface Session {
//     user: {
//       id: string;
//       role: UserRole;
//       permissions: Record<string, boolean>;
//       vendorStatus?: VendorStatus;
//       isSuspended?: boolean; // Added
//       rejectionReason?: string | null;
//     } & DefaultSession["user"];
//   }

//   interface User extends DefaultUser {
//     id: string;
//     role: UserRole;
//     permissions: Record<string, boolean>;
//     vendorStatus?: VendorStatus;
//     isSuspended?: boolean; // Added
//     rejectionReason?: string | null;
//   }
// }

// declare module "next-auth/jwt" {
//   interface JWT {
//     userId: string;    
//     role: UserRole;    
//     permissions: Record<string, boolean>; 
//     vendorStatus?: VendorStatus;
//     isSuspended?: boolean; // Added
//     rejectionReason?: string | null;
//     lastSync?: number;
//   }
// }

// interface AuthUser {
//   id: string;
//   name: string | null;
//   email: string;
//   role: UserRole;
//   permissions: Record<string, boolean>;
//   vendorStatus?: VendorStatus;
//   isSuspended?: boolean; // Added
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

// async function getFreshUserData(userId: string) {
//   return await prisma.user.findUnique({
//     where: { id: userId },
//     select: { 
//       role: true, 
//       permissions: true,
//       adminProfile: { select: { permissions: true } },
//       vendorProfile: { select: { status: true, rejectionReason: true, isSuspended: true } } // Added isSuspended
//     }
//   });
// }

// /* --- 4. Auth Options --- */
// export const authOptions: NextAuthOptions = {
//   debug: false,
//   session: { 
//     strategy: "jwt",
//     maxAge: 30 * 24 * 60 * 60, // 30 days
//   },
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
//                   rejectionReason: true,
//                   isSuspended: true // Added
//                 }
//               }
//             },
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
//             vendorStatus: user.vendorProfile?.status,
//             isSuspended: user.vendorProfile?.isSuspended || false, // Added
//             rejectionReason: user.vendorProfile?.rejectionReason,
//           };
//         } catch (error) {
//           console.error("Authorize Error:", error);
//           return null;
//         }
//       },
//     }),
//   ],

//   callbacks: {
//     async jwt({ token, user, trigger, session }) {
//       // 1. Initial Sign In
//       if (user) {
//         token.userId = user.id;
//         token.role = user.role;
//         token.permissions = user.permissions;
//         token.vendorStatus = user.vendorStatus;
//         token.isSuspended = user.isSuspended; // Added
//         token.rejectionReason = user.rejectionReason;
//         token.lastSync = Math.floor(Date.now() / 1000);
//       }

//       // 2. FORCE REFRESH ON UPDATE
//       if (trigger === "update") {
//         const dbUser = await getFreshUserData(token.userId);
//         if (dbUser) {
//           token.role = session?.role || dbUser.role;
//           token.vendorStatus = dbUser.vendorProfile?.status;
//           token.isSuspended = dbUser.vendorProfile?.isSuspended; // Added
//           token.rejectionReason = dbUser.vendorProfile?.rejectionReason;
//           token.permissions = normalizePermissions(dbUser.permissions, dbUser.adminProfile?.permissions);
//           token.lastSync = Math.floor(Date.now() / 1000);
//         }
//         return token;
//       }

//       // 3. Periodic Background Sync (Every 1 hour)
//       const ONE_HOUR = 3600;
//       const now = Math.floor(Date.now() / 1000);
//       if (token.userId && (!token.lastSync || (now - token.lastSync) > ONE_HOUR)) {
//         const dbUser = await getFreshUserData(token.userId);
//         if (dbUser) {
//           token.role = dbUser.role;
//           token.vendorStatus = dbUser.vendorProfile?.status;
//           token.isSuspended = dbUser.vendorProfile?.isSuspended; // Added
//           token.permissions = normalizePermissions(dbUser.permissions, dbUser.adminProfile?.permissions);
//           token.lastSync = now;
//         }
//       }

//       return token;
//     },

//     async session({ session, token }) {
//       if (token && session.user) {
//         session.user.id = token.userId;
//         session.user.role = token.role;
//         session.user.permissions = token.permissions;
//         session.user.vendorStatus = token.vendorStatus;
//         session.user.isSuspended = token.isSuspended; // Added
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
  manageVerifications: false,
};

/* --- 2. Module Augmentation --- */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      permissions: Record<string, boolean>;
      vendorStatus?: VendorStatus;
      isSuspended?: boolean;
      balance?: number; 
      rejectionReason?: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    role: UserRole;
    permissions: Record<string, boolean>;
    vendorStatus?: VendorStatus;
    isSuspended?: boolean;
    balance?: number; 
    rejectionReason?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;    
    role: UserRole;    
    permissions: Record<string, boolean>; 
    vendorStatus?: VendorStatus;
    isSuspended?: boolean;
    balance?: number; 
    rejectionReason?: string | null;
    lastSync?: number;
  }
}

interface AuthUser {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  permissions: Record<string, boolean>;
  vendorStatus?: VendorStatus;
  isSuspended?: boolean;
  balance?: number;
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

async function getFreshUserData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { 
      role: true, 
      permissions: true,
      adminProfile: { select: { permissions: true } },
      vendorProfile: { 
        select: { 
          status: true, 
          rejectionReason: true, 
          isSuspended: true,
          balance: true 
        } 
      }
    }
  });
  return user;
}

/* --- 4. Auth Options --- */
export const authOptions: NextAuthOptions = {
  debug: false,
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, 
  },
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
              vendorProfile: true 
            },
          });

          if (!user?.passwordHash) return null;

          const isValid = await bcrypt.compare(password, user.passwordHash);
          if (!isValid) return null;

          // Using type casting to access vendorProfile properties safely
          const vendor = user.vendorProfile as any;

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            permissions: normalizePermissions(user.permissions, user.adminProfile?.permissions),
            vendorStatus: user.vendorProfile?.status,
            isSuspended: user.vendorProfile?.isSuspended || false,
            balance: Number(user.vendorProfile?.balance || 0),
            rejectionReason: user.vendorProfile?.rejectionReason,
          };
        } catch (error) {
          console.error("Authorize Error:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.userId = user.id;
        token.role = user.role;
        token.permissions = user.permissions;
        token.vendorStatus = user.vendorStatus;
        token.isSuspended = user.isSuspended;
        token.balance = user.balance; 
        token.rejectionReason = user.rejectionReason;
        token.lastSync = Math.floor(Date.now() / 1000);
      }

      if (trigger === "update") {
        const dbUser = (await getFreshUserData(token.userId)) as any;
        if (dbUser) {
          token.role = session?.role || dbUser.role;
          token.vendorStatus = dbUser.vendorProfile?.status;
          token.isSuspended = dbUser.vendorProfile?.isSuspended;
          token.balance = Number(dbUser.vendorProfile?.balance || 0); 
          token.rejectionReason = dbUser.vendorProfile?.rejectionReason;
          token.permissions = normalizePermissions(dbUser.permissions, dbUser.adminProfile?.permissions);
          token.lastSync = Math.floor(Date.now() / 1000);
        }
        return token;
      }

      const ONE_HOUR = 3600;
      const now = Math.floor(Date.now() / 1000);
      if (token.userId && (!token.lastSync || (now - token.lastSync) > ONE_HOUR)) {
        const dbUser = (await getFreshUserData(token.userId)) as any;
        if (dbUser) {
          token.role = dbUser.role;
          token.vendorStatus = dbUser.vendorProfile?.status;
          token.isSuspended = dbUser.vendorProfile?.isSuspended;
          token.balance = Number(dbUser.vendorProfile?.balance || 0); 
          token.permissions = normalizePermissions(dbUser.permissions, dbUser.adminProfile?.permissions);
          token.lastSync = now;
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
        session.user.isSuspended = token.isSuspended;
        session.user.balance = token.balance; 
        session.user.rejectionReason = token.rejectionReason;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);