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
      await AuthService.verifyVendorRegistration(
        uid,
        code
      );

    return NextResponse.json(
      result
    );
  } catch (error) {
    return handleApiError(error);
  }
}