
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // ✅ MUST AWAIT params (Next.js 15 requirement)
  const { id } = await context.params;

  // Ensure authenticated
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    if (!order)
      return NextResponse.json({ message: "Order not found" }, { status: 404 });

    if (order.userId !== userId)
      return new NextResponse("Forbidden", { status: 403 });

    return NextResponse.json(order);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

