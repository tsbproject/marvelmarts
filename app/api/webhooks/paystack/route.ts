import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.text(); // Get raw body for verification
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest("hex");

    // 1. Verify Signature
    if (hash !== req.headers.get("x-paystack-signature")) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);

    // 2. Handle successful charge
    if (event.event === "charge.success") {
      const { reference, metadata } = event.data;

      // Update the order in Prisma
      await prisma.order.update({
        where: { id: metadata.orderId }, // We pass this in the metadata during checkout
        data: {
          paymentStatus: true,
          status: "processing", // Move from pending to processing automatically
          paymentIntentId: reference,
        },
      });

      console.log(`✅ Order ${metadata.orderId} verified and paid.`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Webhook Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}