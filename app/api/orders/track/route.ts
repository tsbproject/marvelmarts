import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderNumber = searchParams.get("orderNumber");

  if (!orderNumber) {
    return NextResponse.json({ error: "Order number required" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true }
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json(order);
}