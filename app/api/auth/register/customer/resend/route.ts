import { NextResponse } from "next/server";

import {
  handleApiError,
} from "@/app/lib/auth/api";

import { AuthService } from "@/app/lib/services/auth.service";
import { verifyOrigin } from "@/app/lib/auth/csrf";
import {
  customerResendCodeSchema,
} from "@/app/lib/validations/auth";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = withApiLogging(
  async (request: Request) => {
    try {
      verifyOrigin(request);

      const body = await request.json();

      const { uid } =
        customerResendCodeSchema.parse(body);

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