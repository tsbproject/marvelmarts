import type { Session } from "next-auth";
import { UserRole } from "@prisma/client";

import type {
  AdminPermissions,
} from "./types";

/* -------------------------------------------------------------------------- */
/*                            ROLE MEMBERSHIP                                 */
/* -------------------------------------------------------------------------- */

function hasRole(
  session: Session | null,
  role: UserRole
): boolean {
  if (!session?.user) {
    return false;
  }

  const roles: UserRole[] =
    session.user.roles?.length
      ? (session.user.roles as UserRole[])
      : session.user.role
        ? [session.user.role as UserRole]
        : [];

  return roles.includes(role);
}

/* -------------------------------------------------------------------------- */
/*                               ROLE HELPERS                                 */
/* -------------------------------------------------------------------------- */

export function isAuthenticated(
  session: Session | null
): boolean {
  return !!session?.user?.id;
}

export function isCustomer(
  session: Session | null
): boolean {
  return hasRole(
    session,
    UserRole.CUSTOMER
  );
}

export function isVendor(
  session: Session | null
): boolean {
  return hasRole(
    session,
    UserRole.VENDOR
  );
}

export function isAdmin(
  session: Session | null
): boolean {
  return (
    hasRole(
      session,
      UserRole.ADMIN
    ) ||
    hasRole(
      session,
      UserRole.SUPER_ADMIN
    )
  );
}

export function isSuperAdmin(
  session: Session | null
): boolean {
  return hasRole(
    session,
    UserRole.SUPER_ADMIN
  );
}

/* -------------------------------------------------------------------------- */
/*                          ADMIN PERMISSIONS                                 */
/* -------------------------------------------------------------------------- */

export function hasPermission(
  session: Session | null,
  permission: keyof AdminPermissions
): boolean {
  if (
    isSuperAdmin(session)
  ) {
    return true;
  }

  if (
    !isAdmin(session)
  ) {
    return false;
  }

  return (
    session?.user?.admin?.[
      permission
    ] === true
  );
}