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
      email,
      firstName,
      lastName,
    } = await request.json();

    const result =
      await AuthService.sendVendorRegistrationCode(
        email,
        firstName,
        lastName
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