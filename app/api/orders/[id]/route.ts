import { prisma } from "@/app/_lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/_lib/auth";
import { NextResponse } from "next/server";

interface Params {
  params: { id: string };
}

export async function GET(req: Request, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true, variant: true } } },
    });

    if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });
    if (order.userId !== userId) return new NextResponse("Forbidden", { status: 403 });

    return NextResponse.json(order);
  } catch (err) {
    console.error("GET /api/orders/[id] error:", err);
    return NextResponse.json({ message: "Failed to fetch order" }, { status: 500 });
  }
}
