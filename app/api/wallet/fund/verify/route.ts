import { NextResponse } from "next/server";

import {
  requireAuth,
  handleApiError,
} from "@/app/lib/auth/api";

import { badRequest } from "@/app/lib/auth/errors";

import { WalletService } from "@/app/lib/services/wallet.service";

export async function POST(request: Request) {
  try {
    const session = await requireAuth();

    const { reference } = await request.json();

    if (!reference) {
      throw badRequest(
        "Payment reference is required."
      );
    }

    const result =
      await WalletService.verifyWalletFunding({
        userId: session.user.id,
        reference,
      });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    return handleApiError(error);
  }
}