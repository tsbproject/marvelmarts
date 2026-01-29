import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const guestCart = await req.json(); // { items: [{ productId, variantId, qty, unitPrice }] }

  const cart = await prisma.cart.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id },
    update: {},
  });

  for (const item of guestCart.items) {
    // Check for existing matching item (match both Product AND Variant)
    const existing = await prisma.cartItem.findFirst({
      where: { 
        cartId: cart.id, 
        productId: item.productId,
        variantId: item.variantId ?? null 
      },
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { qty: existing.qty + item.qty },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: item.productId,
          variantId: item.variantId ?? null,
          qty: item.qty,
          unitPrice: item.unitPrice,
        },
      });
    }
  }

  return NextResponse.json({ success: true });
}