import { AuthService } from "@/app/lib/services/auth.service";
import { handleApiError } from "@/app/lib/auth/api";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request
) {
  try {
    const { email } =
      await request.json();

    const result =
      await AuthService.sendPasswordResetCode(
        email
      );

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}