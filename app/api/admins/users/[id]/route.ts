import { NextResponse } from "next/server";

import { AuthService } from "@/app/lib/services/auth.service";

import {
  requireManageUsers,
  requireSuperAdmin,
} from "@/app/lib/auth/guards";

import { handleApiError } from "@/app/lib/auth/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* -------------------------------------------------------------------------- */
/*                               UPDATE USER                                  */
/* -------------------------------------------------------------------------- */

export async function PATCH(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    await requireManageUsers();

    const { id: userId } =
      await params;

    const body =
      await req.json();

    console.log(
      `Updating User ${userId}:`,
      body
    );

    const updatedUser =
      await AuthService.updateUser(
        userId,
        body
      );

    return NextResponse.json(
      updatedUser
    );
  } catch (error: any) {
    console.error(
      "PATCH ERROR:",
      error.message
    );

    if (
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          error:
            "Email already in use",
        },
        {
          status: 400,
        }
      );
    }

    return handleApiError(error);
  }
}

/* -------------------------------------------------------------------------- */
/*                               DELETE USER                                  */
/* -------------------------------------------------------------------------- */

export async function DELETE(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    await requireSuperAdmin();

    const { id } =
      await params;

    await AuthService.deleteUser(
      id
    );

    return NextResponse.json({
      message:
        "User deleted successfully",
    });
  } catch (error: any) {
    console.error(
      "DELETE ERROR:",
      error.message
    );

    return handleApiError(error);
  }
}