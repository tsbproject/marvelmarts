import type { Session } from "next-auth";

import {
  hasPermission,
} from "./authorization";

export const canManageAdmins = (
  session: Session | null
) =>
  hasPermission(
    session,
    "manageAdmins"
  );

export const canManageUsers = (
  session: Session | null
) =>
  hasPermission(
    session,
    "manageUsers"
  );

export const canManageBlogs = (
  session: Session | null
) =>
  hasPermission(
    session,
    "manageBlogs"
  );

export const canManageProducts = (
  session: Session | null
) =>
  hasPermission(
    session,
    "manageProducts"
  );

export const canManageOrders = (
  session: Session | null
) =>
  hasPermission(
    session,
    "manageOrders"
  );

export const canManageMessages = (
  session: Session | null
) =>
  hasPermission(
    session,
    "manageMessages"
  );

export const canManageSettings = (
  session: Session | null
) =>
  hasPermission(
    session,
    "manageSettings"
  );

export const canManageCategories = (
  session: Session | null
) =>
  hasPermission(
    session,
    "manageCategories"
  );

export const canManageVendors = (
  session: Session | null
) =>
  hasPermission(
    session,
    "manageVendors"
  );

export const canManageVerifications = (
  session: Session | null
) =>
  hasPermission(
    session,
    "manageVerifications"
  );

export const canManageSubscribers = (
  session: Session | null
) =>
  hasPermission(
    session,
    "manageSubscribers"
  );

export const canManageReviews = (
  session: Session | null
) =>
  hasPermission(
    session,
    "manageReviews"
  );

export const canManageActivity = (
  session: Session | null
) =>
  hasPermission(
    session,
    "manageActivity"
  );

export const canManageTrending = (
  session: Session | null
) =>
  hasPermission(
    session,
    "manageTrending"
  );

export const canManageSupport = (
  session: Session | null
) =>
  hasPermission(
    session,
    "manageSupport"
  );

export const canManagePayout = (
  session: Session | null
) =>
  hasPermission(
    session,
    "managePayout"
  );