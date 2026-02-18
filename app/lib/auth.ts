



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
//         async jwt({ token, user, trigger, session }) {
//       // 1. Initial Sign In
//       if (user) {
//         token.userId = user.id;
//         token.role = user.role;
//         token.permissions = user.permissions;
//         token.vendorStatus = user.vendorStatus;
//         token.rejectionReason = user.rejectionReason;
//         return token; // Return early
//       }


//       // 2. Handle Manual Trigger (Switcher)
//         if (trigger === "update" && session?.role) {
//           token.role = session.role;
//           return token; // Return early to avoid DB query below
//         }
      
      
//       // 3. Optimized DB Sync (Only sync once in a while or if essential)
//   // Check if we already have the data to avoid spamming Prisma
//   if (token.userId && !token.lastSync) { 
//     const dbUser = await prisma.user.findUnique({
//       where: { id: token.userId },
//       select: { 
//         role: true, 
//         permissions: true,
//         adminProfile: { select: { permissions: true } },
//         vendorProfile: { select: { status: true, rejectionReason: true } }
//       }
//     });
       
    
//     if (dbUser) {
//       token.role = dbUser.role;
//       token.vendorStatus = dbUser.vendorProfile?.status;
//       token.permissions = normalizePermissions(dbUser.permissions, dbUser.adminProfile?.permissions);
//       token.lastSync = Math.floor(Date.now() / 1000); // Timestamp the sync
//     }
//   }
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

/**
 * Fetches the freshest user data from Prisma to sync with the Session
 */
async function getFreshUserData(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: { 
      role: true, 
      permissions: true,
      adminProfile: { select: { permissions: true } },
      vendorProfile: { select: { status: true, rejectionReason: true } }
    }
  });
}

/* --- 4. Auth Options --- */
export const authOptions: NextAuthOptions = {
  debug: false,
  session: { 
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
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

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            permissions: normalizePermissions(user.permissions, user.adminProfile?.permissions),
            vendorStatus: user.vendorProfile?.status,
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
      // 1. Initial Sign In
      if (user) {
        token.userId = user.id;
        token.role = user.role;
        token.permissions = user.permissions;
        token.vendorStatus = user.vendorStatus;
        token.rejectionReason = user.rejectionReason;
        token.lastSync = Math.floor(Date.now() / 1000);
      }

      // 2. FORCE REFRESH ON UPDATE
      // When SessionUpdater or Toggle calls update(), we fetch fresh data from Prisma
      if (trigger === "update") {
        const dbUser = await getFreshUserData(token.userId);
        if (dbUser) {
          // If the update call passed a specific role (like the Toggle does), use it
          // otherwise, use the role stored in the database.
          token.role = session?.role || dbUser.role;
          token.vendorStatus = dbUser.vendorProfile?.status;
          token.rejectionReason = dbUser.vendorProfile?.rejectionReason;
          token.permissions = normalizePermissions(dbUser.permissions, dbUser.adminProfile?.permissions);
          token.lastSync = Math.floor(Date.now() / 1000);
        }
        return token;
      }

      // 3. Periodic Background Sync (Every 1 hour)
      const ONE_HOUR = 3600;
      const now = Math.floor(Date.now() / 1000);
      if (token.userId && (!token.lastSync || (now - token.lastSync) > ONE_HOUR)) {
        const dbUser = await getFreshUserData(token.userId);
        if (dbUser) {
          token.role = dbUser.role;
          token.vendorStatus = dbUser.vendorProfile?.status;
          token.vendorStatus = dbUser.vendorProfile?.status;
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
        session.user.rejectionReason = token.rejectionReason;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);