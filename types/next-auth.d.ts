
import type { DefaultSession } from "next-auth";
import { UserRole, VendorStatus } from "@prisma/client"; 
import type { AdminPermissions } from "@/app/lib/auth/types";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      roles: UserRole[];
      role: UserRole;
     
      admin?: AdminPermissions;
     
      vendorStatus?: VendorStatus | null;
      isSuspended?: boolean;
      rejectionReason?: string | null;

      vendorProfileId?: string;

      balance?: number;

      identityDoc?: string | null;

      businessDoc?: string | null;

      locationDoc?: string | null;
    } & DefaultSession["user"];
  }

      interface User {
      id: string;
      name: string | null;
      email: string;
      image?: string | null;

      role: UserRole;
      roles: UserRole[];

     admin?: AdminPermissions;

      passwordHash?: string;

      vendorStatus?: VendorStatus | null;
      isSuspended?: boolean;
      rejectionReason?: string | null;

      vendorProfileId?: string;

      balance?: number;

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
    admin?: AdminPermissions;
    // Added Vendor Specific Fields
    vendorStatus?: VendorStatus | null;
    isSuspended?: boolean;
    rejectionReason?: string | null;

    vendorProfileId?: string;

    balance?: number;

    identityDoc?: string | null;

    businessDoc?: string | null;

    locationDoc?: string | null;

    lastSync?: number;
  }
}