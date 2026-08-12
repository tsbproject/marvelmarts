import { Prisma } from "@prisma/client";

import { prisma } from "@/app/lib/prisma";

import type { AuthDatabaseUser } from "./types";

/* -------------------------------------------------------------------------- */
/*                      SHARED PRISMA AUTH INCLUDE                            */
/* -------------------------------------------------------------------------- */

export const AUTH_USER_INCLUDE = {
  adminProfile: true,

  vendorProfile: {
    select: {
      id: true,
      status: true,
      rejectionReason: true,
      isSuspended: true,
      balance: true,

      // Vendor verification state
      identityDoc: true,
      businessDoc: true,
      locationDoc: true,
    },
  },
} satisfies Prisma.UserInclude;

/* -------------------------------------------------------------------------- */
/*                           AUTH USER LOOKUP                                 */
/* -------------------------------------------------------------------------- */

export async function getUserForAuth(
  where:
    | {
        id: string;
      }
    | {
        email: {
          equals: string;
          mode: "insensitive";
        };
      }
): Promise<AuthDatabaseUser | null> {
  return prisma.user.findFirst({
    where,
    include: AUTH_USER_INCLUDE,
  });
}

/* -------------------------------------------------------------------------- */
/*                         REFRESH AUTH USER                                  */
/* -------------------------------------------------------------------------- */

export async function getFreshUserData(
  userId: string
): Promise<AuthDatabaseUser | null> {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },

    include: AUTH_USER_INCLUDE,
  });
}