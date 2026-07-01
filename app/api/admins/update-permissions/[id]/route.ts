import { NextRequest, NextResponse } from "next/server";

import { UserRole } from "@prisma/client";

import { prisma } from "@/app/lib/prisma";

import { requireSuperAdmin } from "@/app/lib/auth/guards";
import { handleApiError } from "@/app/lib/auth/api";

import {
  PERMISSION_KEYS,
  defaultAdminPermissions,
  serializeAdminPermissions,
} from "@/app/lib/auth/admin-permissions";

import type {
  AdminPermissions,
} from "@/app/lib/auth/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface UpdatePermissionsRequest {
  permissions: Partial<AdminPermissions>;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    /* ---------------------------------------------------------------------- */
    /* SECURITY                                                               */
    /* ---------------------------------------------------------------------- */

    const session = await requireSuperAdmin();

    /* ---------------------------------------------------------------------- */
    /* PARAMS                                                                 */
    /* ---------------------------------------------------------------------- */

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid administrator id.",
        },
        {
          status: 400,
        }
      );
    }

    /**
     * Prevent accidental self-lockout.
     */
    if (id === session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error:
            "You cannot modify your own administrator permissions.",
        },
        {
          status: 400,
        }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* REQUEST                                                                */
    /* ---------------------------------------------------------------------- */

    const body =
      (await req.json()) as UpdatePermissionsRequest;

    if (
      !body.permissions ||
      typeof body.permissions !== "object"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid permissions object.",
        },
        {
          status: 400,
        }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* VERIFY TARGET                                                          */
    /* ---------------------------------------------------------------------- */

    const targetUser =
      await prisma.user.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

    if (!targetUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Administrator not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (
      targetUser.role !== UserRole.ADMIN &&
      targetUser.role !== UserRole.SUPER_ADMIN
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Permissions may only be assigned to administrators.",
        },
        {
          status: 400,
        }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* SANITIZE PERMISSIONS                                                   */
    /* ---------------------------------------------------------------------- */

    const permissions: AdminPermissions = {
      ...defaultAdminPermissions,
    };

    for (const key of PERMISSION_KEYS) {
      const value = body.permissions[key];

      if (typeof value === "boolean") {
        permissions[key] = value;
      }
    }

    /* ---------------------------------------------------------------------- */
    /* DATABASE                                                               */
    /* ---------------------------------------------------------------------- */

    const result =
      await prisma.$transaction(async (tx) => {
        const profile =
          await tx.adminProfile.upsert({
            where: {
              userId: id,
            },

            update: {
              ...permissions,
            },

            create: {
              userId: id,
              ...permissions,
            },
          });

        const user =
          await tx.user.findUnique({
            where: {
              id,
            },

            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          });

        if (!user) {
          throw new Error(
            "Administrator no longer exists."
          );
        }

        return {
          user,
          profile,
        };
      });

    /* ---------------------------------------------------------------------- */
    /* AUDIT (Temporary)                                                      */
    /* ---------------------------------------------------------------------- */

    console.log(
      `[Admin Permissions Updated] By: ${session.user.email} → ${result.user.email}`
    );

    /* ---------------------------------------------------------------------- */
    /* RESPONSE                                                               */
    /* ---------------------------------------------------------------------- */

    return NextResponse.json(
      {
        success: true,

        message:
          "Administrator permissions updated successfully.",

        admin: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          permissions:
            serializeAdminPermissions(
              result.profile
            ),
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}