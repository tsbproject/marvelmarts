import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import {
  sendOrderConfirmationEmail,
  sendAdminOrderNotification,
} from "@/app/lib/mailer";

import {
  mapOrderToOrderConfirmationEmail,
} from "@/app/lib/mail/mappers/order.mapper";

export async function POST(req: Request) {
  try {
    const { reference, orderId } = await req.json();

    if (!reference || !orderId) {
      return NextResponse.json(
        { error: "Missing reference or orderId" },
        { status: 400 }
      );
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        vendorProfile: {
          select: {
            storeName: true,
          },
        },
      },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (existingOrder.paymentStatus) {
      return NextResponse.json({
        success: true,
        orderId: existingOrder.id,
        orderNumber: existingOrder.orderNumber,
        message: "Order already processed",
      });
    }

    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = await paystackRes.json();

    if (!paystackRes.ok || !data.status || data?.data?.status !== "success") {
      return NextResponse.json(
        { error: "Payment verification failed with provider" },
        { status: 400 }
      );
    }

    const metadata = data?.data?.metadata || {};
    const metadataOrderId = metadata?.orderId || null;
    const metadataOrderNumber = metadata?.orderNumber || null;

    if (
      metadataOrderId &&
      metadataOrderId !== existingOrder.id
    ) {
      return NextResponse.json(
        { error: "Payment reference does not match this order" },
        { status: 400 }
      );
    }

    if (
      metadataOrderNumber &&
      metadataOrderNumber !== existingOrder.orderNumber
    ) {
      return NextResponse.json(
        { error: "Payment order number mismatch" },
        { status: 400 }
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id: existingOrder.id },
      data: {
        paymentStatus: true,
        status: "processing",
        paymentIntentId: reference,
      },
      include: {
        items: true,
        vendorProfile: {
          select: {
            storeName: true,
          },
        },
      },
    });

    try {
      console.log(`Dispatching emails for Order: ${updatedOrder.orderNumber}`);

      await Promise.all([
        sendOrderConfirmationEmail(
          mapOrderToOrderConfirmationEmail(
            updatedOrder
          )
        ),

        sendAdminOrderNotification(
          updatedOrder
        ),
      ]);

      console.log("All notifications sent successfully");
    } catch (mailErr: any) {
      console.error("Email dispatch failed:", mailErr.message);
    }

    return NextResponse.json({
      success: true,
      orderId: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      status: updatedOrder.status,
    });
  } catch (error: any) {
    console.error("VERIFY_ERROR:", error.message);
    return NextResponse.json(
      { error: "Internal server error during verification" },
      { status: 500 }
    );
  }
}