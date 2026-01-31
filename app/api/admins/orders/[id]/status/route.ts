import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { sendAdminOrderNotification } from "@/app/lib/mailer"; 

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // Correct for Next.js 15
) {
  try {
    // 1. Await the params properly
    const resolvedParams = await params;
    const id = resolvedParams.id;

    // 2. Safely parse the JSON body
    const body = await req.json();
    const { status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Missing Order ID or Status" }, { status: 400 });
    }

    // 3. Perform the Update
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
    });

    // 4. Email Logic
    if (status === "SHIPPED") {
      try {
        await sendAdminOrderNotification({
          to: updatedOrder.email,
          subject: `Your MarvelMarts Order is on the move!`,
          html: `<h1>Good news, ${updatedOrder.firstName}!</h1><p>Your order #${updatedOrder.orderNumber} has been shipped.</p>`
        });
      } catch (mailError) {
        console.error("Email failed but order updated:", mailError);
        // We don't want to crash the whole response if just the email fails
      }
    }

    return NextResponse.json(updatedOrder);

  } catch (error: any) {
    console.error("PATCH Error:", error);
    // Ensure we ALWAYS return JSON, never a string or empty
    return NextResponse.json(
      { error: error.message || "Internal Server Error" }, 
      { status: 500 }
    );
  }
}