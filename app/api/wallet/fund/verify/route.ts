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

    try {
      const wallet =
        await WalletService.creditVerifiedPayment(
          session.user.id,
          Number(transaction.amount) / 100,
          reference,
          "Wallet funding"
        );

      console.log(
        "Wallet verification result:",
        wallet
      );

      if (metadata.saveCard) {
        try {
          const saved =
            await PaymentService.savePaymentMethod(
              session.user.id,
              reference
            );

          console.log(
            "Card save result:",
            saved
          );
        } catch (error) {
          console.error(
            "Card save failed:",
            error
          );
        }
      }

      return NextResponse.json({
        success: true,
        wallet,
        returnUrl:
          typeof metadata.returnUrl === "string"
            ? metadata.returnUrl
            : "/account/customer/payment-methods",
      });
    } catch (error) {
      console.error(
        "VERIFY ROUTE ERROR:",
        error
      );

      throw error;
    }
  } catch (error) {
    return handleApiError(error);
  }
}