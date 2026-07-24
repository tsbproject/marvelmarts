import { NextRequest, NextResponse } from "next/server";

import { AuthService } from "@/app/lib/services/auth.service";
import { handleApiError, requireSuperAdmin } from "@/app/lib/auth/api";
import { badRequest } from "@/app/lib/auth/errors";

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

    const body =
      (await req.json()) as UpdatePermissionsRequest;

    if (
      !body.permissions ||
      typeof body.permissions !==
        "object"
    ) {
      throw badRequest(
        "Invalid permissions object."
      );
    }

    const admin =
      await AuthService.updateAdministratorPermissions(
        id,
        {
          id: session.user.id,
          email:
            session.user.email ??
            null,
        },
        body.permissions
      );

    return NextResponse.json(
      {
        success: true,
        message:
          "Administrator permissions updated successfully.",
        admin,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}