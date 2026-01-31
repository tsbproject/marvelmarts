




import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { sendOrderConfirmationEmail, sendAdminOrderNotification } from "@/app/lib/mailer";

export async function POST(req: Request) {
  try {
    const { reference, orderId } = await req.json();

    if (!reference || !orderId) {
      return NextResponse.json({ error: "Missing reference or orderId" }, { status: 400 });
    }

    // 1. Fetch current order state to prevent double-processing
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (existingOrder.paymentStatus) {
      return NextResponse.json({ success: true, message: "Order already processed" });
    }

    // 2. Verify with Paystack
    const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    const data = await paystackRes.json();

    if (data.status && data.data.status === "success") {
      // 3. Update Order in Database
      // We include 'items' so the email templates have the data they need
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: true,
          status: "processing", // Or 'paid' depending on your flow
          paymentIntentId: reference,
        },
        include: {
          items: true,
        }
      });

      // 4. Trigger Notifications (Async but awaited for Vercel stability)
      try {
        console.log(` Dispatching emails for Order: ${updatedOrder.orderNumber}`);
        
        // Run both emails. Using Promise.all handles them in parallel for speed.
        await Promise.all([
          sendOrderConfirmationEmail(updatedOrder),
          sendAdminOrderNotification(updatedOrder)
        ]);

        console.log("✅ All notifications sent successfully");
      } catch (mailErr: any) {
        // We log the error but allow the response to succeed since the DB is updated
        console.error("⚠️ Email dispatch failed:", mailErr.message);
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Payment verification failed with provider" }, { status: 400 });

  } catch (error: any) {
    console.error("❌ VERIFY_ERROR:", error.message);
    return NextResponse.json({ error: "Internal server error during verification" }, { status: 500 });
  }
}