import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import prismadb from "@/app/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { amount, items, shippingAddress } = await req.json();

    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    // ATOMIC TRANSACTION: Both must succeed or both fail
    const result = await prismadb.$transaction(async (tx) => {
      // 1. Check & Deduct Balance
      const user = await tx.user.update({
        where: { email: session.user.email! },
        data: {
          walletBalance: { decrement: amount }
        }
      });

      if (user.walletBalance < 0) {
        throw new Error("Insufficient funds for this transaction");
      }

      // 2. Create the Order
      const order = await tx.order.create({
        data: {
          userId: user.id,
          totalAmount: amount,
          isPaid: true,
          status: "PAID",
          // ... add your mapping for cart items here
        }
      });

      return order;
    });

    return NextResponse.json({ orderId: result.id });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}