import {
  NextRequest,
  NextResponse,
} from "next/server";

import { AuthService } from "@/app/lib/services/auth.service";

import {
  requireSuperAdmin,
  handleApiError,
} from "@/app/lib/auth/api";

import { verifyOrigin } from "@/app/lib/auth/csrf";

import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST =
  withApiLogging(
    async (
      req: NextRequest,
      {
        params,
      }: {
        params: Promise<{
          id: string;
        }>;
      }
    ) => {
      try {
        verifyOrigin(req);

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
  );