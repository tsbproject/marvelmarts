import type { AdminProfile } from "@prisma/client";

import type { AdminPermissions,  AdminPermissionSource, } from "./types";

/* -------------------------------------------------------------------------- */
/*                           ADMIN PERMISSION SOURCE                          */
/* -------------------------------------------------------------------------- */


/* -------------------------------------------------------------------------- */
/*                          DEFAULT PERMISSIONS                               */
/* -------------------------------------------------------------------------- */

export const defaultAdminPermissions: AdminPermissions = {
  manageAdmins: false,
  manageUsers: false,
  manageBlogs: false,
  manageProducts: false,
  manageOrders: false,
  manageMessages: false,
  manageSettings: false,
  manageCategories: false,
  manageVendors: false,
  manageVerifications: false,
  manageSubscribers: false,
  manageReviews: false,
  manageActivity: false,
  manageTrending: false,
  manageSupport: false,
  managePayout: false,
};

/* -------------------------------------------------------------------------- */
/*                             PERMISSION KEYS                                */
/* -------------------------------------------------------------------------- */

export const PERMISSION_KEYS = [
  "manageAdmins",
  "manageUsers",
  "manageBlogs",
  "manageProducts",
  "manageOrders",
  "manageMessages",
  "manageSettings",
  "manageCategories",
  "manageVendors",
  "manageVerifications",
  "manageSubscribers",
  "manageReviews",
  "manageActivity",
  "manageTrending",
  "manageSupport",
  "managePayout",
] as const;

/* -------------------------------------------------------------------------- */
/*                      ADMIN PROFILE → PERMISSIONS                           */
/* -------------------------------------------------------------------------- */

export function serializeAdminPermissions(
  admin: AdminPermissionSource | null | undefined
): AdminPermissions {
  return {
    manageAdmins: admin?.manageAdmins ?? false,
    manageUsers: admin?.manageUsers ?? false,
    manageBlogs: admin?.manageBlogs ?? false,
    manageProducts: admin?.manageProducts ?? false,
    manageOrders: admin?.manageOrders ?? false,
    manageMessages: admin?.manageMessages ?? false,
    manageSettings: admin?.manageSettings ?? false,
    manageCategories: admin?.manageCategories ?? false,
    manageVendors: admin?.manageVendors ?? false,
    manageVerifications: admin?.manageVerifications ?? false,
    manageSubscribers: admin?.manageSubscribers ?? false,
    manageReviews: admin?.manageReviews ?? false,
    manageActivity: admin?.manageActivity ?? false,
    manageTrending: admin?.manageTrending ?? false,
    manageSupport: admin?.manageSupport ?? false,
    managePayout: admin?.managePayout ?? false,
  };
}

/* -------------------------------------------------------------------------- */
/*                      PERMISSIONS → ADMIN PROFILE                           */
/* -------------------------------------------------------------------------- */

export function permissionsToAdminProfile(
  permissions: Partial<AdminPermissions>
): Partial<AdminPermissionSource> {
  return {
    manageAdmins: permissions.manageAdmins ?? false,
    manageUsers: permissions.manageUsers ?? false,
    manageBlogs: permissions.manageBlogs ?? false,
    manageProducts: permissions.manageProducts ?? false,
    manageOrders: permissions.manageOrders ?? false,
    manageMessages: permissions.manageMessages ?? false,
    manageSettings: permissions.manageSettings ?? false,
    manageCategories: permissions.manageCategories ?? false,
    manageVendors: permissions.manageVendors ?? false,
    manageVerifications:
      permissions.manageVerifications ?? false,
    manageSubscribers:
      permissions.manageSubscribers ?? false,
    manageReviews: permissions.manageReviews ?? false,
    manageActivity: permissions.manageActivity ?? false,
    manageTrending: permissions.manageTrending ?? false,
    manageSupport: permissions.manageSupport ?? false,
    managePayout: permissions.managePayout ?? false,
  };
}