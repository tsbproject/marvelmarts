import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcrypt";

// -----------------------------
// ROLE TYPES
// -----------------------------
type AdminRole = "SUPER_ADMIN" | "ADMIN";
type VendorRole = "VENDOR";
type CustomerRole = "CUSTOMER";
type UnifiedRole = AdminRole | VendorRole | CustomerRole;

// -----------------------------
// ACCOUNT TYPES
// -----------------------------
interface AdminAccount {
  id: string;
  email: string;
  name?: string | null;
  role: AdminRole;
  permissions?: Record<string, boolean> | null;
  passwordHash: string;
}

interface VendorAccount {
  id: string;
  email: string;
  name?: string | null;
  passwordHash: string;
}

interface CustomerAccount {
  id: string;
  email: string;
  name?: string | null;
  passwordHash: string;
}

type Account = AdminAccount | VendorAccount | CustomerAccount;

// -----------------------------
// NEXTAUTH CONFIG
// -----------------------------
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },

  pages: {
    signIn: "/auth/sign-in",
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.identifier || !credentials.password) return null;

        const identifier = credentials.identifier.toLowerCase().trim();
        let account: Account | null = null;
        let role: UnifiedRole | null = null;

        // -------------------------
        // 1. ADMIN LOGIN
        // -------------------------
        const admin = await prisma.admin.findFirst({
          where: { email: { equals: identifier, mode: "insensitive" } },
        });

        if (admin) {
          account = admin as AdminAccount;
          role = admin.role;
        }

        // -------------------------
        // 2. VENDOR LOGIN
        // -------------------------
        if (!account) {
          const vendor = await prisma.vendorProfile.findFirst({
            where: { user: { email: { equals: identifier, mode: "insensitive" } } },
            include: { user: true }, // fetch user info
          });

          if (vendor && vendor.user?.passwordHash) {
            account = {
              id: vendor.user.id,
              email: vendor.user.email,
              name: vendor.user.name ?? null,
              passwordHash: vendor.user.passwordHash,
            };
            role = "VENDOR";
          }
        }

        // -------------------------
        // 3. CUSTOMER LOGIN
        // -------------------------
        if (!account) {
          const customer = await prisma.user.findFirst({
            where: { email: { equals: identifier, mode: "insensitive" } },
          });

          if (customer && customer.passwordHash) {
            account = {
              id: customer.id,
              email: customer.email,
              name: customer.name ?? null,
              passwordHash: customer.passwordHash,
            };
            role = "CUSTOMER";
          }
        }

        // -------------------------
        // VALIDATE ACCOUNT
        // -------------------------
        if (!account || !account.passwordHash) return null;

        const isValid = await bcrypt.compare(credentials.password, account.passwordHash);
        if (!isValid) return null;

        // -------------------------
        // RETURN USER OBJECT
        // -------------------------
        return {
          id: account.id,
          name: account.name,
          email: account.email,
          role,
          permissions: "permissions" in account ? account.permissions ?? null : null,
        };
      },
    }),
  ],

  // -----------------------------
  // CALLBACKS
  // -----------------------------
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = user.role;
        token.permissions = user.permissions ?? null;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId;
        session.user.role = token.role;
        session.user.permissions = token.permissions ?? null;
      }
      return session;
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
