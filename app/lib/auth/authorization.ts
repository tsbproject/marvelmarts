import type { Session } from "next-auth";

import type {
  AdminPermissions,
} from "./types";

/* -------------------------------------------------------------------------- */
/*                               ROLE HELPERS                                 */
/* -------------------------------------------------------------------------- */

export function isAuthenticated(
  session: Session | null
): boolean {
  return !!session?.user;
}

export function isCustomer(
  session: Session | null
): boolean {
  return session?.user?.role === "CUSTOMER";
}

export function isVendor(
  session: Session | null
): boolean {
  return session?.user?.role === "VENDOR";
}

export function isAdmin(
  session: Session | null
): boolean {
  return (
    session?.user?.role === "ADMIN" ||
    session?.user?.role === "SUPER_ADMIN"
  );
}

export function isSuperAdmin(
  session: Session | null
): boolean {
  return session?.user?.role === "SUPER_ADMIN";
}

/* -------------------------------------------------------------------------- */
/*                          ADMIN PERMISSIONS                                 */
/* -------------------------------------------------------------------------- */

export function hasPermission(
  session: Session | null,
  permission: keyof AdminPermissions
): boolean {

  if (isSuperAdmin(session)) {
    return true;
  }

  return session?.user?.admin?.[permission] === true;
}