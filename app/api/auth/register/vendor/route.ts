import { NextResponse } from "next/server";

import {
  handleApiError,
} from "@/app/lib/auth/api";

import { AuthService } from "@/app/lib/services/auth.service";
import { verifyOrigin } from "@/app/lib/auth/csrf";
import {
  vendorRegisterSchema,
} from "@/app/lib/validations/auth";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";




export const POST = withApiLogging(
  async (request: Request) => {
    try {
      verifyOrigin(request as any);

      const body =
        await request.json();

      const data =
        vendorRegisterSchema.parse(body);

      const result =
        await AuthService.registerVendor(
          data
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