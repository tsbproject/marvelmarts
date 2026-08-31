import { NextResponse } from "next/server";

import { AuthService } from "@/app/lib/services/auth.service";
import { handleApiError } from "@/app/lib/auth/api";
import { verifyOrigin } from "@/app/lib/auth/csrf";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = withApiLogging(
  async (request: Request) => {
    try {
      verifyOrigin(request);

      const {
        name,
        email,
        password,
      } = await request.json();

      const result =
        await AuthService.sendCustomerRegistrationCode(
          name,
          email,
          password
        );

      return NextResponse.json(
        result,
        {
          status: 201,
        }
      );
    } catch (error) {
      return handleApiError(error);
    }
  }
);