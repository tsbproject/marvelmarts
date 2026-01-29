import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: Request) {
  try {
    const { reference, orderId } = await req.json();

    if (!reference || !orderId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // 1. Verify Transaction with Paystack API
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await paystackResponse.json();

    // 2. Check if Paystack confirms success
    if (data.status === true && data.data.status === "success") {
      const amountPaid = data.data.amount / 100; // Convert Kobo back to Naira

      // 3. Update Order in Database
      // We use a transaction or a specific update to ensure data integrity
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: true,
          status: "processing", // Move from 'pending' to 'processing'
          // Store the reference for accounting/refund purposes
          paymentIntentId: reference, 
        },
      });

      // 4. (Optional) Reduce stock levels here if you track inventory
      
      return NextResponse.json({ 
        success: true, 
        message: "Payment verified and order updated",
        orderNumber: updatedOrder.orderNumber 
      });
    }

    return NextResponse.json(
      { error: "Payment verification failed" }, 
      { status: 400 }
    );

  } catch (error: any) {
    console.error("VERIFY_PAYMENT_ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error during verification" }, 
      { status: 500 }
    );
  }
}