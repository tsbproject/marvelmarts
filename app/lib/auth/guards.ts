import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

import type { Session } from "next-auth";
import type { AdminPermissions } from "./types";

import {
  hasPermission,
  isAdmin,
  isSuperAdmin,
} from "./authorization";

import {
  unauthorized,
  forbidden,
} from "./errors";

/* -------------------------------------------------------------------------- */
/*                               BASE GUARD                                   */
/* -------------------------------------------------------------------------- */

export async function requireAuth(): Promise<Session> {
  const session = await getServerSession(authOptions);



  if (!session) {
    throw unauthorized();
  }

  return session;
}

/* -------------------------------------------------------------------------- */
/*                              ROLE GUARDS                                   */
/* -------------------------------------------------------------------------- */

export async function requireAdmin(): Promise<Session> {
  const session = await requireAuth();

  if (!isAdmin(session)) {
    throw forbidden(
      "Administrator access required."
    );
  }

  return session;
}

export async function requireSuperAdmin(): Promise<Session> {
  const session = await requireAuth();

  if (!isSuperAdmin(session)) {
    throw forbidden(
      "Super Administrator access required."
    );
  }

  return session;
}

/* -------------------------------------------------------------------------- */
/*                          PERMISSION GUARD                                  */
/* -------------------------------------------------------------------------- */

export async function requirePermission(
  permission: keyof AdminPermissions
): Promise<Session> {
  const session = await requireAdmin();

  if (!hasPermission(session, permission)) {
    throw forbidden(
      "Insufficient permissions."
    );
  }

  return session;
}


/* -------------------------------------------------------------------------- */
/*                             REQUIRE VENDOR                                 */
/* -------------------------------------------------------------------------- */

export async function requireVendor() {
  const session = await requireAuth();

  if (session.user.role !== "VENDOR") {
    throw forbidden(
      "Vendor access required."
    );
  }

  return session;
}






export const requireManageAdmins = () =>
  requirePermission("manageAdmins");

export const requireManageUsers = () =>
  requirePermission("manageUsers");

export const requireManageProducts = () =>
  requirePermission("manageProducts");

export const requireManageOrders = () =>
  requirePermission("manageOrders");

export const requireManageMessages = () =>
  requirePermission("manageMessages");

export const requireManageSettings = () =>
  requirePermission("manageSettings");

export const requireManageCategories = () =>
  requirePermission("manageCategories");

export const requireManageVendors = () =>
  requirePermission("manageVendors");

export const requireManageVerifications = () =>
  requirePermission("manageVerifications");

export const requireManageSubscribers = () =>
  requirePermission("manageSubscribers");

export const requireManageReviews = () =>
  requirePermission("manageReviews");

export const requireManageActivity = () =>
  requirePermission("manageActivity");

export const requireManageTrending = () =>
  requirePermission("manageTrending");

export const requireManageSupport = () =>
  requirePermission("manageSupport");

export const requireManagePayout = () =>
  requirePermission("managePayout");











