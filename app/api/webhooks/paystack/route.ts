import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { addCreditsToVendor } from "@/app/_actions/boostActions";
import {
  sendOrderConfirmationEmail,
  sendAdminOrderNotification,
} from "@/app/lib/mailer";

import {
  mapOrderToOrderConfirmationEmail,
} from "@/app/lib/mail/mappers/order.mapper";

export async function POST(req: Request) {
  try {
    console.log("Webhook hit");

    const body = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      console.error("Missing PAYSTACK_SECRET_KEY");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const hash = crypto
      .createHmac("sha512", secretKey)
      .update(body)
      .digest("hex");

    if (!signature || hash !== signature) {
      console.error("Invalid signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);

    if (event.event !== "charge.success") {
      return NextResponse.json({ received: true });
    }

    const { reference, metadata } = event.data || {};

    const existingTransaction = await prisma.creditTransaction.findUnique({
      where: { reference },
    });

    if (existingTransaction) {
      console.log("Duplicate webhook ignored:", reference);
      return NextResponse.json({ received: true });
    }

    if (metadata?.custom_fields) {
      const fields = metadata.custom_fields;

      const vendorIdField = fields.find(
        (f: any) => f.variable_name === "vendor_id"
      );

      const creditsField = fields.find(
        (f: any) => f.variable_name === "credits"
      );

      if (vendorIdField && creditsField) {
        const vendorProfileId = vendorIdField.value;
        const credits = Number(creditsField.value);

        const result = await addCreditsToVendor(
          vendorProfileId,
          credits,
          reference
        );

        if (!result.success) {
          console.error("Credit update failed:", result.error);
          return NextResponse.json(
            { error: result.error || "Credit update failed" },
            { status: 500 }
          );
        }

        return NextResponse.json({ received: true });
      }
    }

    if (metadata?.orderId) {
      const existingOrder = await prisma.order.findUnique({
        where: { id: metadata.orderId },
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
        console.error("Webhook order not found:", metadata.orderId);
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }

      if (
        metadata?.orderNumber &&
        metadata.orderNumber !== existingOrder.orderNumber
      ) {
        console.error("Webhook order number mismatch", {
          metadataOrderNumber: metadata.orderNumber,
          dbOrderNumber: existingOrder.orderNumber,
        });

        return NextResponse.json(
          { error: "Order number mismatch" },
          { status: 400 }
        );
      }

      if (existingOrder.paymentStatus) {
        console.log("Order already processed:", existingOrder.orderNumber);
        return NextResponse.json({ received: true });
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

        if (!updatedOrder.emailSent) {
          await prisma.order.update({
            where: { id: updatedOrder.id },
            data: { emailSent: true },
          });
        }
      } catch (mailErr: any) {
        console.error("Webhook email dispatch failed:", mailErr.message);
      }

      console.log("Order updated successfully:", updatedOrder.orderNumber);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json(
      { error: error.message || "Webhook failed" },
      { status: 500 }
    );
  }
}