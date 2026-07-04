import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { addCreditsToVendor } from "@/app/_actions/boostActions";
import {
  sendAdminOrderNotification,
  sendOrderConfirmationEmail,
} from "@/app/lib/mailer";
import { mapOrderToOrderConfirmationEmail } from "@/app/lib/mail/mappers/order.mapper";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;

    if (!secret) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const body = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    const hash = crypto
      .createHmac("sha512", secret)
      .update(body)
      .digest("hex");

    if (!signature || hash !== signature) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);

    if (event.event !== "charge.success") {
      return NextResponse.json({ received: true });
    }

    const payment = event.data;

    const reference = payment.reference;
    const metadata = payment.metadata ?? {};
    const amount = Number(payment.amount);
    const customerEmail =
      payment.customer?.email?.toLowerCase() ?? "";

    if (!reference) {
      return NextResponse.json(
        { error: "Missing payment reference" },
        { status: 400 }
      );
    }

    // BOOST CREDIT PURCHASE

    if (metadata.custom_fields) {
      const vendorField = metadata.custom_fields.find(
        (f: any) => f.variable_name === "vendor_id"
      );

      const creditsField = metadata.custom_fields.find(
        (f: any) => f.variable_name === "credits"
      );

      if (vendorField && creditsField) {
        const existing =
          await prisma.creditTransaction.findUnique({
            where: {
              reference,
            },
          });

        if (existing) {
          return NextResponse.json({
            received: true,
          });
        }

        const result = await addCreditsToVendor(
          vendorField.value,
          Number(creditsField.value),
          reference
        );

        if (!result.success) {
          return NextResponse.json(
            {
              error:
                result.error ??
                "Unable to add credits.",
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
    }

    if (!metadata.orderId) {
      return NextResponse.json({
        received: true,
      });
    }

    const existingOrder =
      await prisma.order.findUnique({
        where: {
          id: metadata.orderId,
        },
        include: {
          items: true,
          vendorProfile: {
            select: {
              id: true,
              userId: true,
              storeName: true,
            },
          },
        },
      });

    if (!existingOrder) {
      return NextResponse.json(
        {
          error: "Order not found",
        },
        {
          status: 404,
        }
      );
    }

    if (existingOrder.paymentStatus) {
      return NextResponse.json({
        received: true,
      });
    }

    if (
      metadata.orderNumber &&
      metadata.orderNumber !==
        existingOrder.orderNumber
    ) {
      return NextResponse.json(
        {
          error: "Order number mismatch",
        },
        {
          status: 400,
        }
      );
    }

    const expectedAmount =
      Math.round(Number(existingOrder.total) * 100);

    if (expectedAmount !== amount) {
      return NextResponse.json(
        {
          error: "Payment amount mismatch",
        },
        {
          status: 400,
        }
      );
    }

    if (
      existingOrder.email &&
      customerEmail &&
      existingOrder.email.toLowerCase() !==
        customerEmail
    ) {
      return NextResponse.json(
        {
          error: "Customer email mismatch",
        },
        {
          status: 400,
        }
      );
    }

          const updatedOrder = await prisma.$transaction(async (tx) => {
        const order = await tx.order.update({
          where: {
            id: existingOrder.id,
          },
          data: {
            paymentStatus: true,
            paymentIntentId: reference,
            status: "processing",
          },
          include: {
            items: true,
            vendorProfile: {
              select: {
                id: true,
                userId: true,
                storeName: true,
              },
            },
          },
        });

        // Credit Vendor Balance
        await tx.vendorProfile.update({
          where: {
            id: order.vendorProfileId,
          },
          data: {
            balance: {
              increment: Number(order.subtotal),
            },
          },
        });

        // Clear Customer Cart
        if (order.userId) {
          await tx.cartItem.deleteMany({
            where: {
              cart: {
                userId: order.userId,
              },
            },
          });
        }

        return order;
      });

      // Send Emails (outside transaction)
      try {
        if (!updatedOrder.emailSent) {
          await Promise.all([
            sendOrderConfirmationEmail(
              mapOrderToOrderConfirmationEmail(updatedOrder)
            ),

            sendAdminOrderNotification(updatedOrder),
          ]);

          await prisma.order.update({
            where: {
              id: updatedOrder.id,
            },
            data: {
              emailSent: true,
            },
          });
        }
      } catch (mailError: any) {
        console.error(
          "ORDER_EMAIL_ERROR:",
          mailError?.message ?? mailError
        );
      }

      console.log(
        `PAYMENT_CONFIRMED: ${updatedOrder.orderNumber}`
      );

      return NextResponse.json({
        success: true,
        received: true,
        orderId: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status,
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