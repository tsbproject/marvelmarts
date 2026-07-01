import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";
import type { AdminPermissions,} from "@/app/lib/auth/types";
import {  defaultAdminPermissions,
  permissionsToAdminProfile,  
  serializeAdminPermissions,} 
  from "@/app/lib/auth/admin-permissions";
import {requireManageAdmins, requireSuperAdmin,
} from "@/app/lib/auth/guards";
import { handleApiError,} from "@/app/lib/auth/api";
import { Prisma, UserRole } from "@prisma/client";




export const runtime = "nodejs";
export const dynamic = "force-dynamic";


/* ========================================================================== */
/* GET: Fetch Administrator                                                   */
/* ========================================================================== */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    /* ---------------------------------------------------------------------- */
    /* SECURITY                                                               */
    /* ---------------------------------------------------------------------- */

    await requireManageAdmins();

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

    /* ---------------------------------------------------------------------- */
    /* FETCH ADMIN                                                            */
    /* ---------------------------------------------------------------------- */

    const user = await prisma.user.findUnique({
      where: {
        id,
      },

      include: {
        adminProfile: true,
      },
    });

    if (!user) {
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

    /* ---------------------------------------------------------------------- */
    /* VALIDATE ROLE                                                          */
    /* ---------------------------------------------------------------------- */

    const isAdministrator =
      user.role === "ADMIN" ||
      user.role === "SUPER_ADMIN";

    if (!isAdministrator) {
      return NextResponse.json(
        {
          success: false,
          error: "User is not an administrator.",
        },
        {
          status: 400,
        }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* RESPONSE                                                               */
    /* ---------------------------------------------------------------------- */

    return NextResponse.json(
      {
        success: true,

        user: {
          ...user,

          adminProfile: user.adminProfile
            ? {
                ...user.adminProfile,

                permissions:
                  serializeAdminPermissions(
                    user.adminProfile
                  ),
              }
            : {
                permissions:
                  defaultAdminPermissions,
              },
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

/* ========================================================================== */
/* PUT: Update Administrator                                                  */
/* ========================================================================== */

interface UpdateAdminRequest {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  permissions?: Partial<AdminPermissions>;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    /* ---------------------------------------------------------------------- */
    /* SECURITY                                                               */
    /* ---------------------------------------------------------------------- */

    const session = await requireManageAdmins();

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

    /* ---------------------------------------------------------------------- */
    /* REQUEST                                                                */
    /* ---------------------------------------------------------------------- */

    const body =
      (await req.json()) as UpdateAdminRequest;

    /* ---------------------------------------------------------------------- */
    /* VERIFY TARGET                                                          */
    /* ---------------------------------------------------------------------- */

    const target = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!target) {
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

    /**
     * Only SUPER_ADMIN may modify another SUPER_ADMIN.
     */
    if (
      target.role === UserRole.SUPER_ADMIN &&
      session.user.role !== UserRole.SUPER_ADMIN
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Only Super Administrators can modify another Super Administrator.",
        },
        {
          status: 403,
        }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* UPDATE DATA                                                            */
    /* ---------------------------------------------------------------------- */

    const updateData: Prisma.UserUpdateInput = {};

    if (body.name) {
      updateData.name = body.name.trim();
    }

    if (body.email) {
      updateData.email =
        body.email.toLowerCase().trim();
    }

    if (
      body.role &&
      session.user.role === UserRole.SUPER_ADMIN
    ) {
      updateData.role = body.role;
      updateData.roles = [body.role];
    }

    if (body.password) {
      updateData.passwordHash =
        await bcrypt.hash(body.password, 10);
    }

    /* ---------------------------------------------------------------------- */
    /* DATABASE                                                               */
    /* ---------------------------------------------------------------------- */

    const result =
      await prisma.$transaction(async (tx) => {

        const user =
          await tx.user.update({
            where: {
              id,
            },
            data: updateData,
          });

        if (body.permissions) {
          await tx.adminProfile.upsert({
            where: {
              userId: id,
            },

            update: permissionsToAdminProfile(
              body.permissions
            ),

            create: {
              userId: id,
              ...permissionsToAdminProfile(
                body.permissions
              ),
            },
          });
        }

        return user;
      });

    /* ---------------------------------------------------------------------- */
    /* AUDIT (Temporary)                                                      */
    /* ---------------------------------------------------------------------- */

    console.log(
      `[Admin Updated] By: ${session.user.email} → ${result.email}`
    );

    /* ---------------------------------------------------------------------- */
    /* RESPONSE                                                               */
    /* ---------------------------------------------------------------------- */

    return NextResponse.json(
      {
        success: true,
        message:
          "Administrator updated successfully.",
        user: result,
      },
      {
        status: 200,
      }
    );

  } catch (error) {
    return handleApiError(error);
  }
}

/* ========================================================================== */
/* DELETE: Remove Administrator                                               */
/* ========================================================================== */

export async function DELETE(
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
     * Prevent deleting yourself.
     */
    if (session.user.id === id) {
      return NextResponse.json(
        {
          success: false,
          error:
            "You cannot delete your own administrator account.",
        },
        {
          status: 400,
        }
      );
    }

    /* ---------------------------------------------------------------------- */
    /* VERIFY TARGET                                                          */
    /* ---------------------------------------------------------------------- */

    const target = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!target) {
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

    /* ---------------------------------------------------------------------- */
    /* DATABASE                                                               */
    /* ---------------------------------------------------------------------- */

    await prisma.$transaction(async (tx) => {

      /**
       * Remove vendor products.
       */
      await tx.product.deleteMany({
        where: {
          vendorProfileId: id,
        },
      });

      /**
       * Detach orders if nullable.
       */
      try {
        await tx.order.updateMany({
          where: {
            userId: id,
          },
          data: {
            userId: null,
          },
        });
      } catch {
        console.warn(
          "Order detachment skipped."
        );
      }

      /**
       * Remove related records.
       */
      await tx.account.deleteMany({
        where: {
          userId: id,
        },
      });

      await tx.address.deleteMany({
        where: {
          userId: id,
        },
      });

      await tx.review.deleteMany({
        where: {
          userId: id,
        },
      });

      await tx.adminProfile.deleteMany({
        where: {
          userId: id,
        },
      });

      await tx.vendorProfile.deleteMany({
        where: {
          userId: id,
        },
      });

      /**
       * Finally remove the user.
       */
      await tx.user.delete({
        where: {
          id,
        },
      });
    });

    /* ---------------------------------------------------------------------- */
    /* AUDIT (Temporary)                                                      */
    /* ---------------------------------------------------------------------- */

    console.log(
      `[Admin Deleted] By: ${session.user.email} → ${target.email}`
    );

    /* ---------------------------------------------------------------------- */
    /* RESPONSE                                                               */
    /* ---------------------------------------------------------------------- */

    return NextResponse.json(
      {
        success: true,
        message:
          "Administrator removed successfully.",
      },
      {
        status: 200,
      }
    );

  } catch (error) {
    return handleApiError(error);
  }
}