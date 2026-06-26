import type { AdminProfile } from "@prisma/client";
import type { Permissions } from "@/types/admin";

/**
 * Converts AdminProfile → Permissions object
 */
export function serializeAdminPermissions(
  profile: Pick<
    AdminProfile,
    | "manageAdmins"
    | "manageUsers"
    | "manageBlogs"
    | "manageProducts"
    | "manageOrders"
    | "manageMessages"
    | "manageSettings"
    | "manageCategories"
    | "manageVendors"
    | "manageVerifications"
    | "manageSubscribers"
    | "manageReviews"
    | "manageActivity"
    | "manageTrending"
    | "manageSupport"
    | "managePayout"
  >
): Permissions {
  return {
    manageAdmins: profile.manageAdmins,
    manageUsers: profile.manageUsers,
    manageBlogs: profile.manageBlogs,
    manageProducts: profile.manageProducts,
    manageOrders: profile.manageOrders,
    manageMessages: profile.manageMessages,
    manageSettings: profile.manageSettings,
    manageCategories: profile.manageCategories,
    manageVendors: profile.manageVendors,
    manageVerifications: profile.manageVerifications,
    manageSubscribers: profile.manageSubscribers,
    manageReviews: profile.manageReviews,
    manageActivity: profile.manageActivity,
    manageTrending: profile.manageTrending,
    manageSupport: profile.manageSupport,
    managePayout: profile.managePayout,
  };
}



/**
 * Converts API Permissions → Prisma AdminProfile
 */
export function permissionsToAdminProfile(
  permissions: Partial<Permissions>
) {
  return {
    manageAdmins:
      permissions.manageAdmins ?? false,

    manageUsers:
      permissions.manageUsers ?? false,

    manageBlogs:
      permissions.manageBlogs ?? false,

    manageProducts:
      permissions.manageProducts ?? false,

    manageOrders:
      permissions.manageOrders ?? false,

    manageMessages:
      permissions.manageMessages ?? false,

    manageSettings:
      permissions.manageSettings ?? false,

    manageCategories:
      permissions.manageCategories ?? false,

    manageVendors:
      permissions.manageVendors ?? false,

    manageVerifications:
      permissions.manageVerifications ?? false,

    manageSubscribers:
      permissions.manageSubscribers ?? false,

    manageReviews:
      permissions.manageReviews ?? false,

    manageActivity:
      permissions.manageActivity ?? false,

    manageTrending:
      permissions.manageTrending ?? false,

    manageSupport:
      permissions.manageSupport ?? false,

    managePayout:
      permissions.managePayout ?? false,
  };
}