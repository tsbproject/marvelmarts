import { NextResponse } from "next/server";

import {
  requireAuth,
  handleApiError,
} from "@/app/lib/auth/api";

import { badRequest } from "@/app/lib/auth/errors";

import { PaymentService } from "@/app/lib/services/payment.service";
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

    const transaction =
      await PaymentService.verifyTransaction(
        reference
      );

    const metadata =
      transaction.metadata ?? {};

    if (metadata.type !== "wallet") {
      throw badRequest("Invalid payment type.");
    }

    if (
      metadata.userId !== session.user.id
    ) {
      throw badRequest(
        "Payment does not belong to this user."
      );
    }

    const wallet =
    await WalletService.creditVerifiedPayment(
        session.user.id,
        Number(transaction.amount) / 100,
        reference,
        "Wallet funding"
    );

    return NextResponse.json(wallet);
  } catch (error) {
    return handleApiError(error);
  }
}