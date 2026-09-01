import { NextResponse } from "next/server";

import { AuthService } from "@/app/lib/services/auth.service";
import { handleApiError } from "@/app/lib/auth/api";
import { verifyOrigin } from "@/app/lib/auth/csrf";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";
import {
  customerRegisterSchema,
} from "@/app/lib/validations/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = withApiLogging(
  async (request: Request) => {
    try {
      verifyOrigin(request);

      const body = await request.json();

      const {
        email,
        name,
      } = customerRegisterSchema.parse(body);

      const result =
        await AuthService.registerCustomer(
          email,
          name
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