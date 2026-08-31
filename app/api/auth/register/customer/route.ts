import { NextResponse } from "next/server";
import { z } from "zod";

import { AuthService } from "@/app/lib/services/auth.service";
import { handleApiError } from "@/app/lib/auth/api";
import { verifyOrigin } from "@/app/lib/auth/csrf";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const customerRegisterSchema = z.object({
  email: z.string().email(
    "Valid email required"
  ),

  name: z.string().min(
    1,
    "Name is required"
  ),
});

export const POST = withApiLogging(
  async (request: Request) => {
    try {
      verifyOrigin(request);

      const body =
        await request.json();

      const parsed =
        customerRegisterSchema.safeParse(
          body
        );

      if (!parsed.success) {
        return NextResponse.json(
          {
            error: "Invalid payload",
            details:
              parsed.error.format(),
          },
          {
            status: 400,
          }
        );
      }

      const result =
        await AuthService.registerCustomer(
          parsed.data.email,
          parsed.data.name
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