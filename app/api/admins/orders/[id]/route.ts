// app/api/admins/orders/[id]/route.ts
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  
  // Security Gate
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { status, refundReason } = body;

    // Build the update data dynamically
    const updateData: any = { status };

    // If it's a refund, add the extra fields
    if (status === "refunded") {
      if (session.user.role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Level 2 clearance required for refunds" }, { status: 403 });
      }
      updateData.refundStatus = "completed";
      updateData.refundReason = refundReason || "Administrative Reversal";
    }

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: updateData
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("API Update Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}