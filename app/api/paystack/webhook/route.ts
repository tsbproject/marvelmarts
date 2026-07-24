import { NextRequest, NextResponse } from "next/server";
import { WalletService } from "@/app/lib/services/wallet.service";
import { PaymentService } from "@/app/lib/services/payment.service";
import { OrderService } from "@/app/lib/services/order.service";
import { requirePaystackWebhook } from "@/app/lib/auth/webhook";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const event =
      await requirePaystackWebhook(request);

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

        if (
          metadata?.type === "order" &&
          metadata?.orderId
      ) {
          const transaction =
              await PaymentService.verifyTransaction(reference);

          await OrderService.completePaidOrder(
              metadata.orderId,
              reference
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