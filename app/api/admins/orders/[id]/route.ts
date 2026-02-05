import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { NextResponse, NextRequest } from "next/server";

// Next.js 15+ Requirement: Params must be handled as a Promise
type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: NextRequest, context: Context) {
  const session = await getServerSession(authOptions);
  
  // 1. Await the dynamic parameters (Fixes Vercel Build Error)
  const { id } = await context.params;

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
      where: { id: id }, // Use the awaited id
      data: updateData
    });

    // 2. TACTICAL SERIALIZATION
    // Convert any Prisma Decimals to Numbers to prevent serialization errors
    const serializedOrder = {
      ...updatedOrder,
      total: (updatedOrder as any).total ? Number((updatedOrder as any).total) : 0,
    };

    return NextResponse.json(serializedOrder);
  } catch (error) {
    console.error("API Update Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}