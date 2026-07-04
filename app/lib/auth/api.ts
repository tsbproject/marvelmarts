import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma, UserRole } from "@prisma/client";
import prisma from "@/app/lib/prisma";
import { notFound } from "@/app/lib/auth/errors";
import { ZodError } from "zod";

import { authOptions } from "@/app/lib/auth";
import { handleAuthError } from "./handlers";
import {
  unauthorized,
  forbidden,
} from "./errors";

/* -------------------------------------------------------------------------- */
/*                          API ERROR HANDLER                                 */
/* -------------------------------------------------------------------------- */

export function handleApiError(error: unknown) {
  const authResponse = handleAuthError(error);

  if (authResponse) {
    return authResponse;
  }

  /* ---------------------------------------------------------------------- */
  /* ZOD VALIDATION                                                         */
  /* ---------------------------------------------------------------------- */

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: "Validation failed.",
        errors: error.flatten().fieldErrors,
      },
      {
        status: 400,
      }
    );
  }

  /* ---------------------------------------------------------------------- */
  /* PRISMA ERRORS                                                          */
  /* ---------------------------------------------------------------------- */

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return NextResponse.json(
          {
            success: false,
            error: "A record with this value already exists.",
            code: error.code,
          },
          {
            status: 409,
          }
        );

      case "P2025":
        return NextResponse.json(
          {
            success: false,
            error: "Requested resource was not found.",
            code: error.code,
          },
          {
            status: 404,
          }
        );

      case "P2003":
        return NextResponse.json(
          {
            success: false,
            error: "Operation failed because related data exists.",
            code: error.code,
          },
          {
            status: 400,
          }
        );

      default:
        console.error(error);

        return NextResponse.json(
          {
            success: false,
            error: "Database operation failed.",
            code: error.code,
          },
          {
            status: 400,
          }
        );
    }
  }

  /* ---------------------------------------------------------------------- */
  /* NORMAL ERRORS                                                          */
  /* ---------------------------------------------------------------------- */

  if (error instanceof Error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }

  /* ---------------------------------------------------------------------- */
  /* UNKNOWN                                                                */
  /* ---------------------------------------------------------------------- */

  console.error(error);

  return NextResponse.json(
    {
      success: false,
      error: "Internal server error.",
    },
    {
      status: 500,
    }
  );
}

/* -------------------------------------------------------------------------- */
/*                              AUTH HELPERS                                  */
/* -------------------------------------------------------------------------- */

export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw unauthorized();
  }

  return session;
}

export async function requireRole(
  ...roles: UserRole[]
) {
  const session = await requireAuth();

  const role = session.user.role as UserRole | undefined;

  if (!role || !roles.includes(role)) {
    throw forbidden(
      "You do not have permission to perform this action."
    );
  }

  return session;
}

export async function requireAdmin() {
  return requireRole(
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN
  );
}

export async function requireVendor() {
  return requireRole(UserRole.VENDOR);
}

export async function requireCustomer() {
  return requireRole(UserRole.CUSTOMER);
}



export async function requireVendorProfile() {
    const session = await requireVendor();

    const vendor = await prisma.vendorProfile.findUnique({
        where: {
            userId: session.user.id,
        },
        select: {
            id: true,
        },
    });

    if (!vendor) {
        throw notFound("Vendor profile not found.");
    }

    return {
        session,
        vendor,
    };
}