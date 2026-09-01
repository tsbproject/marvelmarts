import { NextResponse } from "next/server";

import {
  handleApiError,
} from "@/app/lib/auth/api";

import { verifyOrigin } from "@/app/lib/auth/csrf";

import { AuthService } from "@/app/lib/services/auth.service";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";
import { verifyRegistrationSchema } from "@/app/lib/validations/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = withApiLogging(
  async (request: Request) => {
    try {
      verifyOrigin(request);

     const body = await request.json();

        const {
          uid,
          code,
        } = verifyRegistrationSchema.parse(body);

      const result =
        await AuthService.verifyCustomerRegistration(
          uid,
          code
        );

      return NextResponse.json(
        result,
        {
          status: 201,
        }
      );
    } catch (error: any) {
      if (
        error?.code === "P2002" ||
        error?.message?.includes(
          "Unique constraint"
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Email already registered.",
          },
          {
            status: 400,
          }
        );
      }

      return handleApiError(error);
    }
  }
);