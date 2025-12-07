// // app/lib/auth.ts
// import type { NextAuthOptions } from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import { prisma } from "@/app/lib/prisma";
// import bcrypt from "bcrypt";

// type AdminRole = "SUPER_ADMIN" | "ADMIN";
// type VendorRole = "VENDOR";
// type CustomerRole = "CUSTOMER";
// type UnifiedRole = AdminRole | VendorRole | CustomerRole;

// interface AuthUser {
//   id: string;
//   name: string | null;
//   email: string;
//   role: UnifiedRole;
//   permissions: Record<string, boolean>;
//   passwordHash?: string;
// }

// export const authOptions: NextAuthOptions = {
//   session: { strategy: "jwt" },

//   pages: {
//     signIn: "/auth/sign-in",
//   },

//   providers: [
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         identifier: { label: "Email or Username", type: "text" },
//         password: { label: "Password", type: "password" },
//       },

//       async authorize(credentials): Promise<AuthUser | null> {
//         if (!credentials?.identifier || !credentials.password) return null;
//         const identifier = credentials.identifier.toLowerCase().trim();

//         // 1) ADMIN: check admin table
//         // 1) ADMIN: strict lookup in admin table
           
        
//         // 1) ADMIN login
//                   const admin = await prisma.admin.findUnique({
//                     where: { email: identifier },
//                   });

//                   if (admin) {
//                     const isValid = await bcrypt.compare(credentials.password, admin.passwordHash);
//                     if (!isValid) return null;

//                     return {
//                       id: admin.id,
//                       name: admin.name,
//                       email: admin.email,
//                       role: admin.role,
//                       permissions: admin.permissions ?? {},
//                     };
//                   }



//         // 2) VENDOR: check vendorProfile -> user
//         const vendor = await prisma.vendorProfile.findFirst({
//           where: { user: { email: { equals: identifier, mode: "insensitive" } } },
//           include: { user: true },
//         });

//         if (vendor?.user?.passwordHash) {
//           const ok = await bcrypt.compare(credentials.password, vendor.user.passwordHash);
//           if (!ok) return null;

//           return {
//             id: vendor.user.id,
//             name: vendor.user.name ?? null,
//             email: vendor.user.email,
//             role: "VENDOR",
//             permissions: {},
//             passwordHash: vendor.user.passwordHash,
//           };
//         }

//         // 3) CUSTOMER: check user table
//         const customer = await prisma.user.findFirst({
//           where: { email: { equals: identifier, mode: "insensitive" } },
//         });

//         if (customer?.passwordHash) {
//           const ok = await bcrypt.compare(credentials.password, customer.passwordHash);
//           if (!ok) return null;

//           return {
//             id: customer.id,
//             name: customer.name ?? null,
//             email: customer.email,
//             role: "CUSTOMER",
//             permissions: {},
//             passwordHash: customer.passwordHash,
//           };
//         }

//         // no match
//         return null;
//       },
//     }),
//   ],

//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         // user comes from authorize return object
//         token.userId = user.id;
//         token.role = user.role;
//         token.permissions = (user.permissions ?? {}) as Record<string, boolean>;
//       }
//       return token;
//     },

//     async session({ session, token }) {
//       if (session.user) {
//         session.user.id = token.userId as string;
//         session.user.role = token.role as UnifiedRole;
//         session.user.permissions = (token.permissions ?? {}) as Record<string, boolean>;
//       }
//       return session;
//     },

//     redirect({ url, baseUrl }) {
//       if (url.startsWith("/")) return baseUrl + url;
//       try {
//         return new URL(url).toString();
//       } catch {
//         return baseUrl;
//       }
//     },
//   },

//   secret: process.env.NEXTAUTH_SECRET,
// };




// app/lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcrypt";

export type UnifiedRole = "SUPER_ADMIN" | "ADMIN" | "VENDOR" | "CUSTOMER";

interface AuthUser {
  id: string;
  name: string | null;
  email: string;
  role: UnifiedRole;
  permissions: Record<string, boolean>;
  passwordHash?: string; // used internally only
}

export const authOptions: NextAuthOptions = {
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
        if (!credentials?.identifier || !credentials.password) return null;
        const email = credentials.identifier.toLowerCase().trim();

        // -------------------------
        // 1) ADMIN LOGIN (email only)
        // -------------------------
        const admin = await prisma.admin.findUnique({ where: { email } });
        if (admin) {
          const valid = await bcrypt.compare(credentials.password, admin.passwordHash);
          if (!valid) return null;

          return {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            permissions: admin.permissions ?? {},
          };
        }

        // -------------------------
        // 2) VENDOR LOGIN
        // -------------------------
        const vendor = await prisma.vendorProfile.findFirst({
          where: { user: { email: { equals: email, mode: "insensitive" } } },
          include: { user: true },
        });

        if (vendor?.user?.passwordHash) {
          const valid = await bcrypt.compare(credentials.password, vendor.user.passwordHash);
          if (!valid) return null;

          return {
            id: vendor.user.id,
            name: vendor.user.name ?? null,
            email: vendor.user.email,
            role: "VENDOR",
            permissions: {},
          };
        }

        // -------------------------
        // 3) CUSTOMER LOGIN
        // -------------------------
        const customer = await prisma.user.findFirst({
          where: { email: { equals: email, mode: "insensitive" } },
        });

        if (customer?.passwordHash) {
          const valid = await bcrypt.compare(credentials.password, customer.passwordHash);
          if (!valid) return null;

          return {
            id: customer.id,
            name: customer.name ?? null,
            email: customer.email,
            role: "CUSTOMER",
            permissions: {},
          };
        }

        return null;
      },
    }),
  ],

  callbacks: {
    // -------------------------
    // JWT callback
    // -------------------------
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = user.role;
        token.permissions = user.permissions ?? {};
      }
      return token;
    },

    // -------------------------
    // Session callback
    // -------------------------
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.role = token.role as UnifiedRole;
        session.user.permissions = token.permissions as Record<string, boolean>;
      }
      return session;
    },

    // -------------------------
    // Redirect callback
    // -------------------------
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

