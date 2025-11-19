import { NextResponse } from "next/server";
import { prisma } from "@/app/_lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/_lib/auth";

// Helper to create a guest cart
async function getOrCreateCart(userId: number | null) {
  if (userId) {
    // logged-in user
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true, variant: true } } },
    });
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: { items: { include: { product: true, variant: true } } },
      });
    }
    return cart;
  } else {
    // guest cart: id = null, just return empty cart
    return { id: null, userId: null, items: [] };
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id ?? null; // null for guest
    const cart = await getOrCreateCart(userId);

    return NextResponse.json(cart);
  } catch (error) {
    console.error("GET /api/cart error:", error);
    return NextResponse.json({ error: "Failed to load cart" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id ?? null;

    const { productId, variantId, qty } = await req.json();

    if (!productId) return NextResponse.json({ error: "Product ID required" }, { status: 400 });

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return NextResponse.json({ error: "Invalid product" }, { status: 400 });

    const unitPrice = product.discountPrice ?? product.price;

    if (!userId) {
      // For guests, we can't persist cart in DB. Return temporary item
      return NextResponse.json({
        id: null,
        userId: null,
        items: [{ id: Date.now(), product, variant: variantId ? { id: variantId } : null, qty: qty ?? 1, unitPrice }],
      });
    }

    // Logged-in user: persist in DB
    let cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) cart = await prisma.cart.create({ data: { userId } });

    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId, variantId: variantId ?? null },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { qty: existingItem.qty + (qty ?? 1) },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          variantId: variantId ?? null,
          qty: qty ?? 1,
          unitPrice,
        },
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { product: true, variant: true } } },
    });

    return NextResponse.json(updatedCart);
  } catch (error) {
    console.error("POST /api/cart error:", error);
    return NextResponse.json({ error: "Failed to add item" }, { status: 500 });
  }
}
