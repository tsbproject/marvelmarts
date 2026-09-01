import { NextResponse } from "next/server";

import { AuthService } from "@/app/lib/services/auth.service";

import { verifyOrigin } from "@/app/lib/auth/csrf";
import { handleApiError } from "@/app/lib/auth/api";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";
import { resetPasswordSchema } from "@/app/lib/validations/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = withApiLogging(
  async (req: Request) => {
    try {
      verifyOrigin(req);

      const body = await req.json();

      const {
        email,
        code,
        newPassword,
      } = resetPasswordSchema.parse(body);

      const result =
        await AuthService.resetPassword(
          email,
          code,
          newPassword
        );

      return NextResponse.json(
        result,
        {
          status: 200,
        }
      );
    } catch (error) {
      return handleApiError(error);
    }
  }
);