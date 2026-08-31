import { NextResponse } from "next/server";

import { AuthService } from "@/app/lib/services/auth.service";

import {
  handleApiError,
  requireSuperAdmin,
} from "@/app/lib/auth/api";

import { verifyOrigin } from "@/app/lib/auth/csrf";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST =
  withApiLogging(
    async (req: Request) => {
      try {
        verifyOrigin(req);

        const session =
          await requireSuperAdmin();

        const body =
          await req.json();

        const user =
          await AuthService.createAdministrator(
            body,
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
  );