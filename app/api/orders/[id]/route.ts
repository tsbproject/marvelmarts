import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/_lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/_lib/auth";


export async function GET(
  req: NextRequest,
  context: { params: { id: string } } // params must be an object (not Promise)
) {
  const { id } = context.params;

  // ensure authenticated
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

    if (!order) return NextResponse.json({ message: "Order not found" }, { status: 404 });

    if (order.userId !== userId) return new NextResponse("Forbidden", { status: 403 });

    return NextResponse.json(order);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
