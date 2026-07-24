import { NextResponse } from "next/server";

import { AuthService } from "@/app/lib/services/auth.service";

import { handleApiError, requireSuperAdmin } from "@/app/lib/auth/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: Request
) {
  try {
    const session =
      await requireSuperAdmin();

    const body =
      await req.json();

    const user =
      await AuthService.createAdministrator(
        body,
        {
          email:
            session.user.email ??
            null,
        }
      );

    return NextResponse.json(
      {
        success: true,
        message:
          "Administrator created successfully.",
        user,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}