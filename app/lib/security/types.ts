import type { Session } from "next-auth";
import type {
  UserRole,
  VendorStatus,
} from "@prisma/client";

import type {
  AdminPermissions,
} from "@/app/lib/auth/types";

/* -------------------------------------------------------------------------- */
/*                          AUTHENTICATED USER                                */
/* -------------------------------------------------------------------------- */

export interface AuthenticatedUser {
  id: string;

  email: string;

  name: string | null;

  role: UserRole;

  roles: UserRole[];

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
/*                         AUTHENTICATED SESSION                              */
/* -------------------------------------------------------------------------- */

export interface AuthenticatedSession
  extends Session {
  user: AuthenticatedUser;
}

/* -------------------------------------------------------------------------- */
/*                              SECURITY ERROR                                */
/* -------------------------------------------------------------------------- */

export class SecurityError extends Error {
  readonly status: number;

  constructor(
    message: string,
    status = 403
  ) {
    super(message);

    this.name = "SecurityError";

    this.status = status;
  }
}