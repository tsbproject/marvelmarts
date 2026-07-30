import { NextRequest, NextResponse } from "next/server";
import {
  requireManageAdmins,
  requireSuperAdmin,
  handleApiError,
} from "@/app/lib/auth/api";
import { AuthService } from "@/app/lib/services/auth.service";

import { UserRole } from "@prisma/client";

import type { AdminPermissions, } from "@/app/lib/auth/types";







export const runtime = "nodejs";
export const dynamic = "force-dynamic";


/* ========================================================================== */
/* GET: Fetch Administrator                                                   */
/* ========================================================================== */

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    await requireManageAdmins();

    const { id } =
      await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid administrator id.",
        },
        {
          status: 400,
        }
      );
    }

    const user =
      await AuthService.getAdministratorById(
        id
      );

    return NextResponse.json(
      {
        success: true,
        user,
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
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const session =
      await requireManageAdmins();

    const { id } =
      await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid administrator id.",
        },
        {
          status: 400,
        }
      );
    }

    const body =
      (await request.json()) as UpdateAdminRequest;

    const user =
      await AuthService.updateAdministrator(
        id,
        body,
        {
          id: session.user.id,
       email: session.user.email ?? null,
          role:
            session.user.role,
        }
      );

    return NextResponse.json(
      {
        success: true,
        message:
          "Administrator updated successfully.",
        user,
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
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const session =
      await requireSuperAdmin();

    const { id } =
      await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid administrator id.",
        },
        {
          status: 400,
        }
      );
    }

    await AuthService.deleteAdministrator(
      id,
      {
        id:
          session.user.id,
        email: session.user.email ?? null,
      }
    );

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