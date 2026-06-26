import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";

import type { AuthUser } from "./types";

/* -------------------------------------------------------------------------- */
/*                    AUTH USER → JWT                                          */
/* -------------------------------------------------------------------------- */

export function applyAuthUserToToken(
  token: JWT,
  user: AuthUser
): JWT {
  token.userId = user.id;

  token.role = user.role;
  token.roles = user.roles;

  token.admin = user.admin;

  token.vendorProfileId =
    user.vendorProfileId;

  token.vendorStatus =
    user.vendorStatus;

  token.isSuspended =
    user.isSuspended;

  token.balance =
    user.balance;

  token.rejectionReason =
    user.rejectionReason;

  token.identityDoc =
    user.identityDoc;

  token.businessDoc =
    user.businessDoc;

  token.locationDoc =
    user.locationDoc;

  token.lastSync = Date.now();

  return token;
}

/* -------------------------------------------------------------------------- */
/*                      JWT → SESSION                                          */
/* -------------------------------------------------------------------------- */

export function applyTokenToSession(
  session: Session,
  token: JWT
): Session {
  if (!session.user) {
    return session;
  }

  session.user.id = token.userId;

  session.user.role = token.role;
  session.user.roles = token.roles;

  session.user.admin = token.admin;

  session.user.vendorStatus =
    token.vendorStatus;

  session.user.vendorProfileId =
    token.vendorProfileId;

  session.user.isSuspended =
    token.isSuspended;

  session.user.balance =
    token.balance;

  session.user.rejectionReason =
    token.rejectionReason;

  session.user.identityDoc =
    token.identityDoc;

  session.user.businessDoc =
    token.businessDoc;

  session.user.locationDoc =
    token.locationDoc;

  return session;
}