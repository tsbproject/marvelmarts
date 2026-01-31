import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import OrderConfirmationEmail from "@/app/lib/mailer"; 

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true, // We need items for the email receipt
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // --- EMAIL TRIGGER LOGIC ---
    // If the order is paid but we haven't sent the confirmation yet
    // Note: You might want to add an 'emailSent' field to your Order model in schema.prisma
    if (order.paymentStatus && !order.emailSent) {
      try {
        await resend.emails.send({
          from: "MarvelMarts <orders@tayobolarinwa.dev>",
          to: order.email,
          subject: `Your MarvelMarts Order #${order.orderNumber} is Confirmed!`,
          react: OrderConfirmationEmail({ order }),
        });

        // Mark as sent so we don't spam the user on refresh
        await prisma.order.update({
          where: { id: order.id },
          data: { emailSent: true },
        });
      } catch (emailErr) {
        console.error("Email failed to send, but payment is valid:", emailErr);
      }
    }

    return NextResponse.json({ 
      paid: order.paymentStatus,
      status: order.status 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}