import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { NextResponse, NextRequest } from "next/server";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: NextRequest, context: Context) {
  const session = await getServerSession(authOptions);
  const { id } = await context.params;

  // Security Gate
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { status, refundReason } = body;

    // Normalize status to uppercase for consistency with Vendor Dashboard
    const normalizedStatus = status.toUpperCase();

    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch current order to get total and vendorId
      const order = await tx.order.findUnique({
        where: { id },
        select: { total: true, vendorProfileId: true, status: true }
      });

      if (!order) throw new Error("Order not found");

      // 2. Prepare update data
      const updateData: any = { status: normalizedStatus };

      if (normalizedStatus === "REFUNDED") {
        if (session.user.role !== "SUPER_ADMIN") {
          throw new Error("Level 2 clearance required for refunds");
        }
        updateData.refundStatus = "completed";
        updateData.refundReason = refundReason || "Administrative Reversal";
      }

      // 3. Update the Order
      const updatedOrder = await tx.order.update({
        where: { id },
        data: updateData
      });

      // 4. BALANCE LOGIC: If status changed to DELIVERED, pay the vendor
      // We check if the previous status wasn't already DELIVERED to prevent double-paying
      if (normalizedStatus === "DELIVERED" && order.status !== "DELIVERED" && order.vendorProfileId) {
        await tx.vendorProfile.update({
          where: { userId: order.vendorProfileId },
          data: {
            balance: {
              increment: order.total // Adds order total to vendor's current balance
            }
          }
        });
      }

      return updatedOrder;
    });

    // TACTICAL SERIALIZATION
    const serializedOrder = {
      ...result,
      total: Number(result.total || 0),
    };

    return NextResponse.json(serializedOrder);
  } catch (error: any) {
    console.error("API Update Error:", error);
    const message = error.message === "Level 2 clearance required for refunds" 
      ? error.message 
      : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: error.message.includes("clearance") ? 403 : 500 });
  }
}




