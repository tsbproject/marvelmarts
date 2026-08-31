import { AuthService } from "@/app/lib/services/auth.service";
import { handleApiError } from "@/app/lib/auth/api";
import { verifyOrigin } from "@/app/lib/auth/csrf";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = withApiLogging(
  async (request: Request) => {
    try {
      verifyOrigin(request);

      const { email } = await request.json();

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