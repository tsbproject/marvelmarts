import type {
  Prisma,
  VendorStatus,
} from "@prisma/client";

import { UserRole } from "@prisma/client";

import type { User as NextAuthUser } from "next-auth";

/* -------------------------------------------------------------------------- */
/*                              SHARED AUTH TYPES                             */
/* -------------------------------------------------------------------------- */

export type UserRoleType =
  (typeof UserRole)[keyof typeof UserRole];

/* -------------------------------------------------------------------------- */
/*                          ADMIN PERMISSION MODEL                            */
/* -------------------------------------------------------------------------- */

export interface AdminPermissions {
  manageAdmins: boolean;
  manageUsers: boolean;
  manageBlogs: boolean;
  manageProducts: boolean;
  manageOrders: boolean;
  manageMessages: boolean;
  manageSettings: boolean;
  manageCategories: boolean;
  manageVendors: boolean;
  manageVerifications: boolean;
  manageSubscribers: boolean;
  manageReviews: boolean;
  manageActivity: boolean;
  manageTrending: boolean;
  manageSupport: boolean;
  managePayout: boolean;
}

/* -------------------------------------------------------------------------- */
/*                              AUTHENTICATED USER                            */
/* -------------------------------------------------------------------------- */

export interface AuthUser extends NextAuthUser {
  id: string;

  email: string;

  name: string | null;

  role: UserRoleType;

  roles: UserRoleType[];

  admin?: AdminPermissions;

  vendorProfileId?: string;

  vendorStatus?: VendorStatus;

  isSuspended: boolean;

  balance: number;

  rejectionReason?: string | null;

  identityDoc?: string | null;

  businessDoc?: string | null;

  locationDoc?: string | null;
}

/* -------------------------------------------------------------------------- */
/*                           DATABASE AUTH PAYLOAD                            */
/* -------------------------------------------------------------------------- */

export type AuthDatabaseUser =
  Prisma.UserGetPayload<{
    include: {
      adminProfile: true;

      vendorProfile: {
        select: {
          id: true;
          status: true;
          rejectionReason: true;
          isSuspended: true;
          balance: true;
          identityDoc: true;
          businessDoc: true;
          locationDoc: true;
        };
      };
    };
  }>;


