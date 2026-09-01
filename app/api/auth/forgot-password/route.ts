import { AuthService } from "@/app/lib/services/auth.service";
import { handleApiError } from "@/app/lib/auth/api";
import { verifyOrigin } from "@/app/lib/auth/csrf";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";
import { NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/app/lib/validations/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = withApiLogging(
  async (request: Request) => {
    try {
      verifyOrigin(request);

      const body = await request.json();

      const { email } =
        forgotPasswordSchema.parse(body);

      const result =
        await AuthService.sendPasswordResetCode(
          email
        );

      return NextResponse.json(result);
    } catch (error) {
      return handleApiError(error);
    }
  }
);