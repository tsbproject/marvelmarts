import NextAuth, { type NextAuthOptions, type DefaultSession, type DefaultUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
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
      role?: UserRole;
      roles: UserRole[];
      permissions: Record<string, boolean>;
      vendorStatus?: VendorStatus;
      vendorProfileId?: string;
      isSuspended?: boolean;
      balance?: number;
      rejectionReason?: string | null;
      identityDoc?: string | null;
      businessDoc?: string | null;
      locationDoc?: string | null;
    } & DefaultSession["user"];
  }

    interface User extends DefaultUser {
    id: string;
    role: UserRole;
    roles: UserRole[];
    permissions: Record<string, boolean>;
    vendorStatus?: VendorStatus;
    vendorProfileId?: string;
    isSuspended?: boolean;
    balance?: number;
    rejectionReason?: string | null;
    identityDoc?: string | null;
    businessDoc?: string | null;
    locationDoc?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    role: UserRole;
    roles: UserRole[];
    permissions: Record<string, boolean>;
    vendorStatus?: VendorStatus;
    vendorProfileId?: string;
    isSuspended?: boolean;
    balance?: number;
    rejectionReason?: string | null;
    identityDoc?: string | null;
    businessDoc?: string | null;
    locationDoc?: string | null;
    lastSync?: number;
  }
}

interface AuthUser {
  id: string;
  name: string | null;
  email: string;
  role?: UserRole;
  roles: UserRole[];
  permissions: Record<string, boolean>;
  vendorStatus?: VendorStatus;
  vendorProfileId?: string;
  isSuspended?: boolean;
  balance?: number;
  rejectionReason?: string | null;
  identityDoc?: string | null;
  businessDoc?: string | null;
  locationDoc?: string | null;
}

/* --- 3. Helper Functions --- */
function normalizePermissions(userPerms: any, profilePerms: any): Record<string, boolean> {
  return { ...DEFAULT_PERMISSIONS, ...(userPerms ?? {}), ...(profilePerms ?? {}) };
}

async function getFreshUserData(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      roles: true,
      permissions: true,
      adminProfile: { select: { permissions: true } },
      vendorProfile: {
        select: {
          id: true,
          status: true,
          rejectionReason: true,
          isSuspended: true,
          balance: true,
          identityDoc: true,
          businessDoc: true,
          locationDoc: true,
        },
      },
    },
  });
}

/* --- 4. Auth Options --- */
export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === "development",
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  jwt: { maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/auth/sign-in", error: "/auth/error" },

  providers: [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      identifier: { label: "Email", type: "text" },
      password: { label: "Password", type: "password" },
            },
            async authorize(credentials): Promise<any> {
              try {
                if (!credentials?.identifier || !credentials?.password) return null;

                const identifier = credentials.identifier.toLowerCase().trim();
                const password = credentials.password;

                const user = await prisma.user.findFirst({
                  where: { email: { equals: identifier, mode: "insensitive" } },
                  include: {
                    adminProfile: true,
                    vendorProfile: true,
                  },
                });

              

                if (!user || !user.passwordHash) return null;

                const isValid = await bcrypt.compare(password, user.passwordHash);
                if (!isValid) return null;

                const roles = (user.roles?.length ? user.roles : ["CUSTOMER"]) as UserRole[];
                const role: UserRole = user.role ?? roles[0] ?? "CUSTOMER";

                const userData = {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  role,
                  roles,
                  permissions: normalizePermissions(
                    user.permissions,
                    user.adminProfile?.permissions
                  ) as Record<string, boolean>,
                  vendorStatus: user.vendorProfile?.status,
                  vendorProfileId: user.vendorProfile?.id,
                  isSuspended: user.vendorProfile?.isSuspended || false,
                  balance: Number(user.vendorProfile?.balance || 0),
                  rejectionReason: user.vendorProfile?.rejectionReason || null,
                  identityDoc: user.vendorProfile?.identityDoc || null,
                  businessDoc: user.vendorProfile?.businessDoc || null,
                  locationDoc: user.vendorProfile?.locationDoc || null,
                };

                return userData;
              } catch (error) {
                console.error("Authorize Error:", error);
                return null;
              }
            },
          }),

          CredentialsProvider({
            id: "verified-login",
            name: "Verified Login",
            credentials: {
              token: { label: "Token", type: "text" },

            },
           async authorize(credentials): Promise<any> {
              try {
                if (!credentials?.token) return null;

                const decoded = jwt.verify(
                  credentials.token,
                  process.env.NEXTAUTH_SECRET!
                ) as {
                  purpose: string;
                  uid: string;
                  userId: string;
                  email: string;
                };

              

                if (decoded.purpose !== "verified-login") return null;

                const user = await prisma.user.findUnique({
                  where: { id: decoded.userId },
                  include: {
                    adminProfile: true,
                    vendorProfile: true,
                  },
                });



                

                if (!user) return null;
                if (user.email.toLowerCase() !== decoded.email.toLowerCase()) return null;

                const roles = (user.roles?.length ? user.roles : ["CUSTOMER"]) as UserRole[];
                const role: UserRole = user.role ?? roles[0] ?? "CUSTOMER";

             

                return {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  role,
                  roles,
                  permissions: normalizePermissions(
                    user.permissions,
                    user.adminProfile?.permissions
                  ) as Record<string, boolean>,
                  vendorStatus: user.vendorProfile?.status,
                  vendorProfileId: user.vendorProfile?.id,
                  isSuspended: user.vendorProfile?.isSuspended || false,
                  balance: Number(user.vendorProfile?.balance || 0),
                  rejectionReason: user.vendorProfile?.rejectionReason || null,
                  identityDoc: user.vendorProfile?.identityDoc || null,
                  businessDoc: user.vendorProfile?.businessDoc || null,
                  locationDoc: user.vendorProfile?.locationDoc || null,
                };
              } catch (error) {
            
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
              token.roles = user.roles;
              token.permissions = user.permissions;
              token.vendorStatus = user.vendorStatus;
              token.vendorProfileId = user.vendorProfileId;
              token.isSuspended = user.isSuspended;
              token.balance = user.balance;
              token.rejectionReason = user.rejectionReason;
              token.identityDoc = user.identityDoc;
              token.businessDoc = user.businessDoc;
              token.locationDoc = user.locationDoc;
              token.lastSync = Math.floor(Date.now() / 1000);
        }

        if (trigger === "update" && session) {

          if (session.vendorStatus) {
            token.vendorStatus = session.vendorStatus as VendorStatus;
          }

        }

        // Refresh every hour or on update trigger
        if (
          trigger === "update" ||
          (
            token.userId &&
            (
              !token.lastSync ||
              Math.floor(Date.now() / 1000) - token.lastSync > 3600
            )
          )
        ) {

          const dbUser = await getFreshUserData(token.userId);

          if (dbUser) {

            token.role = dbUser.role ?? dbUser.roles?.[0] ?? "CUSTOMER";

            token.roles = dbUser.roles?.length
              ? dbUser.roles
              : ["CUSTOMER"];

            token.vendorProfileId = dbUser.vendorProfile?.id;

            token.permissions = normalizePermissions(
              dbUser.permissions,
              dbUser.adminProfile?.permissions
            );

            token.vendorStatus = dbUser.vendorProfile?.status;

            token.isSuspended =
              dbUser.vendorProfile?.isSuspended || false;

            token.balance = Number(
              dbUser.vendorProfile?.balance || 0
            );

            token.rejectionReason =
              dbUser.vendorProfile?.rejectionReason || null;

            token.identityDoc =
              dbUser.vendorProfile?.identityDoc || null;

            token.businessDoc =
              dbUser.vendorProfile?.businessDoc || null;

            token.locationDoc =
              dbUser.vendorProfile?.locationDoc || null;

            token.lastSync = Math.floor(Date.now() / 1000);

          }

        }

        return token;
      },

      async session({ session, token }) {
        if (token && session.user) {
          session.user.id = token.userId;
          session.user.role = token.role;
          session.user.roles = token.roles ?? ["CUSTOMER"];
          session.user.permissions = token.permissions || {};
          session.user.vendorStatus = token.vendorStatus;
          session.user.vendorProfileId = token.vendorProfileId;
          session.user.isSuspended = token.isSuspended;
          session.user.balance = token.balance;
          session.user.rejectionReason = token.rejectionReason;
          session.user.identityDoc = token.identityDoc;
          session.user.businessDoc = token.businessDoc;
          session.user.locationDoc = token.locationDoc;
        }
        return session;
      },
  },
};

export default NextAuth(authOptions);