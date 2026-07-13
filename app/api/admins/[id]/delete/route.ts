import {
  NextRequest,
  NextResponse,
} from "next/server";

import { AuthService } from "@/app/lib/services/auth.service";

import {
  requireSuperAdmin,
} from "@/app/lib/auth/guards";

import {
  handleApiError,
} from "@/app/lib/auth/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
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

    await AuthService.deleteAdministrator(
      id,
      {
        id:
          session.user.id,
        email:
          session.user.email ??
          null,
      }
    );

    return NextResponse.json(
      {
        success: true,
        message:
          "Administrator deleted successfully.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}