import { NextResponse } from "next/server";

import {
  handleApiError,
} from "@/app/lib/auth/api";

import { AuthService } from "@/app/lib/services/auth.service";
import { verifyOrigin } from "@/app/lib/auth/csrf";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = withApiLogging(
  async (request: Request) => {
    try {
      verifyOrigin(request);

      const { uid } =
        await request.json();

      const result =
        await AuthService.resendCustomerVerificationCode(
          uid
        );

      return NextResponse.json(
        result
      );
    } catch (error) {
      return handleApiError(error);
    }
  }
);