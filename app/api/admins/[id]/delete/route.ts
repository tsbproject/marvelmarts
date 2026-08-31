import { NextResponse } from "next/server";

import { AuthService } from "@/app/lib/services/auth.service";

import {
  requireSuperAdmin,
  handleApiError,
} from "@/app/lib/auth/api";

import { verifyOrigin } from "@/app/lib/auth/csrf";

import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const DELETE =
  withApiLogging(
    async (
      req: Request,
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

        const session =
          await requireSuperAdmin();

        const { id } =
          await params;

        await AuthService.deleteAdministrator(
          id,
          {
            id: session.user.id,
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
  );