import { NextResponse } from "next/server";
import { prisma } from "@/app/_lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/_lib/auth";

interface SessionUser {
  id: string; // Change id type to string
  name?: string | null;
  email?: string | null;
}

interface AddToCartBody {
  productId: string; // Change to string
  variantId?: string | null; // Change to string
  qty?: number;
}

interface CartItem {
  id: string; // Change to string
  product: {
    id: string; // Change to string
    title: string;
    discountPrice?: number | null;
    price: number;
  };
  variant: { id: string; name?: string } | null;
  qty: number;
  unitPrice: number;
}

interface Cart {
  id: string | null; // Change to string
  userId: string | null; // Change to string
  items: CartItem[];
}

async function getOrCreateCart(userId: string | null): Promise<Cart> {
  if (userId) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true, variant: true } } },
    });

    if (cart) return cart;

    return prisma.cart.create({
      data: { userId },
      include: { items: { include: { product: true, variant: true } } },
    });
  }

  return { id: null, userId: null, items: [] };
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser | undefined;
    const userId = user?.id ?? null;

    const cart = await getOrCreateCart(userId);

    return NextResponse.json(cart);
  } catch (error) {
    console.error("GET /api/cart error:", error);
    r
