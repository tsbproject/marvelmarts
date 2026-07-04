import { NextResponse } from "next/server";

import {
  handleApiError,
} from "@/app/lib/auth/api";

import { AuthService } from "@/app/lib/services/auth.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request
) {
  try {
    const {
      uid,
      code,
    } = await request.json();

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