import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { sendOrderConfirmationEmail } from "@/app/lib/mailer"; 

export async function POST(req: Request) {
  try {
    const { reference, orderId } = await req.json();

    if (!reference || !orderId) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    // 1. Verify with Paystack
    const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    const data = await paystackRes.json();

    if (data.status && data.data.status === "success") {
      // 2. Update Order in Neon
      // We use 'include: { items: true }' so the email helper has the product list
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: true,
          status: "processing",
          paymentIntentId: reference,
        },
        include: {
          items: true,
        }
      });

      // 3. Trigger Email (Awaited so it doesn't time out on Vercel)
      try {
        console.log(" Attempting to send confirmation email...");
        await sendOrderConfirmationEmail(updatedOrder);
        console.log(" Email dispatched successfully");
      } catch (mailErr: any) {
        // We log the error but DON'T stop the user from seeing their success page
        console.error(" Email failed but order was saved:", mailErr.message);
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
  } catch (error: any) {
    console.error(" VERIFY_ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}