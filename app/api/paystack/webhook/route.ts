import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

import { WalletService } from "@/app/lib/services/wallet.service";
import { PaymentService } from "@/app/lib/services/payment.service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();

    const signature =
      request.headers.get("x-paystack-signature");

    if (!signature) {
      return NextResponse.json(
        { success: false },
        { status: 401 }
      );
    }

    const hash = crypto
      .createHmac(
        "sha512",
        process.env.PAYSTACK_SECRET_KEY!
      )
      .update(body)
      .digest("hex");

    if (hash !== signature) {
      return NextResponse.json(
        { success: false },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);

    switch (event.event) {
      case "charge.success": {
        const reference =
          event.data.reference;

        const metadata =
          event.data.metadata;

        if (
          metadata?.type === "wallet" &&
          metadata?.userId
        ) {
          const transaction =
            await PaymentService.verifyTransaction(reference);
          const userId = metadata.userId;

          await WalletService.creditVerifiedPayment(
            userId,
            Number(transaction.amount) / 100,
            reference,
            "Wallet funding"
          );
        }

        break;
      }

      default:
        break;
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "PAYSTACK_WEBHOOK_ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}