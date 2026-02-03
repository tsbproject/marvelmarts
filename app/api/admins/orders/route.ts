// app/api/admins/orders/route.ts
import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Adding a console log here is CRUCIAL. 
    // If you don't see "API HIT" in your terminal, the frontend isn't reaching this file.
    console.log(" API HIT: Fetching Orders from DB...");

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        // Including the user to get the customer name
        user: {
          select: {
            name: true,
          }
        },
        _count: { select: { items: true } }
      }
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("❌ Prisma Order Error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}