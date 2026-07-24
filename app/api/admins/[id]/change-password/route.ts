import {
  NextRequest,
  NextResponse,
} from "next/server";

import { AuthService } from "@/app/lib/services/auth.service";

import {
  requireSuperAdmin,
   handleApiError,
} from "@/app/lib/auth/api";



export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
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
    await requireSuperAdmin();

    const { id } =
      await params;

    const {
      newPassword,
    } = await req.json();

    await AuthService.resetUserPassword(
      id,
      newPassword
    );

    return NextResponse.json(
      {
        success: true,
        message:
          "Password updated successfully.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}