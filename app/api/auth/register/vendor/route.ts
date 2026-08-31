import { NextResponse } from "next/server";
import { z } from "zod";

import {
  handleApiError,
} from "@/app/lib/auth/api";

import { AuthService } from "@/app/lib/services/auth.service";
import { verifyOrigin } from "@/app/lib/auth/csrf";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const vendorRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),

  firstName: z.string().trim().min(1),

  lastName: z.string().trim().min(1),

  phoneNumber: z.string().trim().min(10),

  storeName: z.string().trim().min(1),

  storePhone: z.string().trim().min(10),

  storeAddress: z.string().trim().min(5),

  state: z.string().trim().min(1),

  country: z.string().trim().default("Nigeria"),

  isReapplication:
    z.boolean().optional(),
});

export const POST = withApiLogging(
  async (request: Request) => {
    try {
      verifyOrigin(request as any);

      const body =
        await request.json();

      const parsed =
        vendorRegisterSchema.safeParse(
          body
        );

      if (!parsed.success) {
        return NextResponse.json(
          {
            error:
              "Missing required details",
            details:
              parsed.error.format(),
          },
          {
            status: 400,
          }
        );
      }

      const result =
        await AuthService.registerVendor(
          parsed.data
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