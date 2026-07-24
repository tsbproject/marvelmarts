import { NextResponse } from "next/server";
import crypto from "crypto";

import { PaymentService } from "@/app/lib/services/payment.service";
import { OrderService } from "@/app/lib/services/order.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: Request
) {
  try {
    const secret =
      process.env.PAYSTACK_SECRET_KEY;

    if (!secret) {
      return NextResponse.json(
        {
          error:
            "Server configuration error",
        },
        {
          status: 500,
        }
      );
    }

    const body =
      await req.text();

    const signature =
      req.headers.get(
        "x-paystack-signature"
      );

    const hash = crypto
      .createHmac(
        "sha512",
        secret
      )
      .update(body)
      .digest("hex");

    if (
      !signature ||
      hash !== signature
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid signature",
        },
        {
          status: 401,
        }
      );
    }

    const event =
      JSON.parse(body);

    if (
      event.event !==
      "charge.success"
    ) {
      return NextResponse.json({
        received: true,
      });
    }

    const payment =
      event.data;

    const reference =
      payment.reference;

    if (!reference) {
      return NextResponse.json(
        {
          error:
            "Missing payment reference",
        },
        {
          status: 400,
        }
      );
    }

    const metadata =
      payment.metadata ?? {};

    const boostResult =
      await PaymentService.processBoostCreditPayment(
        metadata,
        reference
      );

    if (boostResult.handled) {
      if (!boostResult.success) {
        return NextResponse.json(
          {
            error:
              boostResult.error ??
              "Unable to process boost payment.",
          },
          {
            status: 500,
          }
        );
      }

      return NextResponse.json({
        received: true,
      });
    }

    if (!metadata.orderId) {
      return NextResponse.json({
        received: true,
      });
    }

    const order =
      await OrderService.validateWebhookOrder(
        metadata.orderId,
        metadata.orderNumber,
        Number(payment.amount),
        payment.customer?.email?.toLowerCase() ??
          ""
      );

    if (order.paymentStatus) {
      return NextResponse.json({
        received: true,
      });
    }

    const updatedOrder =
      await OrderService.completePaidOrder(
        order.id,
        reference
      );

    console.log(
      `PAYMENT_CONFIRMED: ${updatedOrder.orderNumber}`
    );

    return NextResponse.json({
      success: true,
      received: true,
      orderId:
        updatedOrder.id,
      orderNumber:
        updatedOrder.orderNumber,
      status:
        "processing",
    });
  } catch (error: any) {
    console.error(
      "PAYSTACK_WEBHOOK_ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ??
          "Webhook processing failed",
      },
      {
        status: 500,
      }
    );
  }
}