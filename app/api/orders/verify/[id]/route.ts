import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { Resend } from "resend";
// 1. Fixed Import (Ensuring it matches your file's export type)
import OrderConfirmationEmail from "@/app/_emails/OrderConfirmationEmail"; 

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
        items: true, 
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // --- EMAIL TRIGGER LOGIC ---
    // 2. We check paymentStatus and ensure we haven't sent it before
    if (order.paymentStatus === true && !order.emailSent) {
      if (!order.email) {
        console.error("Order email is missing or null, cannot send confirmation.");
      } else {
        try {
          await resend.emails.send({
            from: "MarvelMarts <orders@tayobolarinwa.dev>",
            to: order.email,
            subject: `Your MarvelMarts Order #${order.orderNumber} is Confirmed!`,
            // 3. Pass component as a valid React Element
            react: OrderConfirmationEmail({ order }),
          });

          // Update the DB so we don't send duplicate emails
          await prisma.order.update({
            where: { id: order.id },
            data: { emailSent: true },
          });
          
          console.log(`Email sent successfully to ${order.email}`);
        } catch (emailErr: any) {
          // Log the specific Resend error for debugging
          console.error("Resend Error:", emailErr.message);
        }
      }
    }

    return NextResponse.json({ 
      paid: order.paymentStatus,
      status: order.status 
    });
  } catch (error: any) {
    console.error("Route Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}