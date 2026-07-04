import { NextResponse } from "next/server";

import { AuthService } from "@/app/lib/services/auth.service";
import { handleApiError } from "@/app/lib/auth/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request
) {
  try {
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