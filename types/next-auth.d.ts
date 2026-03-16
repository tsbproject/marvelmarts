import { DefaultSession } from "next-auth";
import { UserRole, VendorStatus } from "@prisma/client"; 

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      roles: UserRole;
      permissions: Record<string, boolean>;
     
      vendorStatus?: VendorStatus | null;
      isSuspended?: boolean;
      rejectionReason?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    name: string | null;
    email: string | null;
    image?: string | null;
    role: UserRole;
    permissions: Record<string, boolean>;
    passwordHash?: string;
    // Added Vendor Specific Fields
    vendorStatus?: VendorStatus | null;
    isSuspended?: boolean;
    rejectionReason?: string | null;

     user: {
      id: string;
      role: "VENDOR" | "ADMIN" | "SUPER_ADMIN" | "CUSTOMER";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    role: UserRole;
    roles: UserRole;
    permissions: Record<string, boolean>;
    // Added Vendor Specific Fields
    vendorStatus?: VendorStatus | null;
    isSuspended?: boolean;
    rejectionReason?: string | null;
  }
}