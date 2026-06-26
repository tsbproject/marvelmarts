import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { UserRole } from "@prisma/client";

import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { type Permissions } from "@/types/admin";
import { defaultPermissions } from "@/types/admin";
import { serializeAdminPermissions } from "@/app/lib/auth/admin-permissions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface UpdatePermissionsRequest {
  permissions: Partial<Permissions>;
}

const PERMISSION_KEYS: readonly (keyof Permissions)[] = [
  "manageAdmins",
  "manageUsers",
  "manageBlogs",
  "manageProducts",
  "manageOrders",
  "manageMessages",
  "manageSettings",
  "manageCategories",
  "manageVendors",
  "manageVerifications",
  "manageSubscribers",
  "manageReviews",
  "manageActivity",
  "manageTrending",
  "manageSupport",
  "managePayout",
] as const;



export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    /**
     * ---------------------------------------------------------
     * AUTHENTICATION
     * ---------------------------------------------------------
     */
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required.",
        },
        {
          status: 401,
        }
      );
    }

    /**
     * ---------------------------------------------------------
     * AUTHORIZATION
     * ---------------------------------------------------------
     */
    if (session.user.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Only Super Administrators can modify administrator permissions.",
        },
        {
          status: 403,
        }
      );
    }

    /**
     * ---------------------------------------------------------
     * PARAM VALIDATION
     * ---------------------------------------------------------
     */
    const { id } = await params;

    if (!id || typeof id !== "string") {
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
     * Prevent accidental self lockout.
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

    /**
     * ---------------------------------------------------------
     * BODY VALIDATION
     * ---------------------------------------------------------
     */
    let body: UpdatePermissionsRequest;

    try {
        body = await req.json();
    } catch {
        return NextResponse.json(
            {
                success: false,
                error: "Invalid request body.",
            },
            {
                status: 400,
            }
        );
    }

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

    /**
     * ---------------------------------------------------------
     * VERIFY TARGET USER
     * ---------------------------------------------------------
     */
    const targetUser = await prisma.user.findUnique({
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

    /**
     * ---------------------------------------------------------
     * SANITIZE PERMISSIONS
     * ---------------------------------------------------------
     */
    const sanitizedPermissions: Permissions = {
        ...defaultPermissions,
    };

   for (const key of PERMISSION_KEYS) {
    const value = body.permissions[key];

    if (typeof value === "boolean") {
        sanitizedPermissions[key] = value;
    }
}

 

    /**
     * ---------------------------------------------------------
     * DATABASE TRANSACTION
     * ---------------------------------------------------------
     */
    const result = await prisma.$transaction(async (tx) => {

            const profile = await tx.adminProfile.upsert({
        where: {
          userId: id,
        },
       update: {
        ...sanitizedPermissions,
      },
        create: {
        userId: id,
        ...sanitizedPermissions,
      },
      });

      const user = await tx.user.findUnique({
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
        throw new Error("Administrator no longer exists.");
      }

      return {
        profile,
        user,
      };
    });

    /**
     * ---------------------------------------------------------
     * SUCCESS RESPONSE
     * ---------------------------------------------------------
     */
    return NextResponse.json(
      {
        success: true,
        message: "Administrator permissions updated successfully.",
        admin: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          permissions: serializeAdminPermissions(
            result.profile
          ),
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "UPDATE_ADMIN_PERMISSIONS_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "An unexpected server error occurred.",
      },
      {
        status: 500,
      }
    );
  }
}