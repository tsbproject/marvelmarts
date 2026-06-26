import type { AdminProfile } from "@prisma/client";
import { UserRole } from "@prisma/client";

import type {
  AuthDatabaseUser,
  AuthUser,
  UserRoleType,
  AdminPermissions,
} from "./types";

/**
 * Maps AdminProfile → Session Permissions
 */
export function mapAdminPermissions(
  admin: AdminProfile | null
): AdminPermissions | undefined {
  if (!admin) return undefined;

  return {
    manageAdmins: admin.manageAdmins,
    manageUsers: admin.manageUsers,
    manageBlogs: admin.manageBlogs,
    manageProducts: admin.manageProducts,
    manageOrders: admin.manageOrders,
    manageMessages: admin.manageMessages,
    manageSettings: admin.manageSettings,
    manageCategories: admin.manageCategories,
    manageVendors: admin.manageVendors,
    manageVerifications: admin.manageVerifications,
    manageSubscribers: admin.manageSubscribers,
    manageReviews: admin.manageReviews,
    manageActivity: admin.manageActivity,
    manageTrending: admin.manageTrending,
    manageSupport: admin.manageSupport,
    managePayout: admin.managePayout,
  };
}

/**
 * Converts Prisma User → NextAuth User
 */
export function mapAuthUser(
  user: AuthDatabaseUser
): AuthUser {
  const roles: UserRoleType[] = 
    user.roles.length > 0
      ? user.roles
      : [UserRole.CUSTOMER];

  const role: UserRoleType =
    user.role ??
    roles[0] ??
    UserRole.CUSTOMER;

  return {
    id: user.id,

    email: user.email,

    name: user.name,

    role,

    roles,

    admin: mapAdminPermissions(user.adminProfile),

    vendorProfileId: user.vendorProfile?.id,

    vendorStatus: user.vendorProfile?.status,

    isSuspended:
      user.vendorProfile?.isSuspended ?? false,

    balance: Number(
      user.vendorProfile?.balance ?? 0
    ),

    rejectionReason:
      user.vendorProfile?.rejectionReason,

    identityDoc:
      user.vendorProfile?.identityDoc,

    businessDoc:
      user.vendorProfile?.businessDoc,

    locationDoc:
      user.vendorProfile?.locationDoc,
  };
}