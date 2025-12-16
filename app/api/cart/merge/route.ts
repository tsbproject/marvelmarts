// app/api/cart/merge/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const guestCart = await req.json();

  for (const item of guestCart.items) {
    const existing = await prisma.cartItem.findFirst({
      where: { cart: { userId: session.user.id }, productId: item.productId },
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { qty: existing.qty + item.qty },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cart: { connect: { userId: session.user.id } },
          productId: item.productId,
          qty: item.qty,
          unitPrice: item.unitPrice,
        },
      });
    }
  }

  return Response.json({ success: true });
}
