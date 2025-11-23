import { NextResponse } from "next/server";
import { prisma } from "@/app/_lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/_lib/auth";

interface SessionUser {
  id: string; // Changed to string
  name?: string | null;
  email?: string | null;
}

interface AddToCartBody {
  productId: string; // Changed to string
  variantId?: string | null; // Changed to string
  qty?: number;
}

interface CartItem {
  id: string; // Changed to string
  product: {
    id: string; // Changed to string
    title: string;
    discountPrice?: number | null;
    price: number;
  };
  variant: { id: string; name?: string } | null;
  qty: number;
  unitPrice: number;
}

interface Cart {
  id: string | null; // Changed to string
  userId: string | null; // Changed to string
  items: CartItem[];
}

// Helper function to get or create a cart
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

// GET method handler
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser | undefined;
    const userId = user?.id ?? null;

    const cart = await getOrCreateCart(userId);

    return NextResponse.json(cart);
  } catch (error) {
    console.error("GET /api/cart error:", error);
    return NextResponse.json({ error: "Failed to load cart" }, { status: 500 });
  }
}

// POST method handler
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser | undefined;
    const userId = user?.id ?? null;

    const body: AddToCartBody = await req.json();
    const { productId, variantId, qty } = body;

    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return NextResponse.json({ error: "Invalid product" }, { status: 400 });

    const unitPrice = product.discountPrice ?? product.price;

    if (!userId) {
      // Guest cart
      return NextResponse.json({
        id: null,
        userId: null,
        items: [
          {
            id: Date.now().toString(), // Convert to string
            product,
            variant: variantId ? { id: variantId } : null,
            qty: qty ?? 1,
            unitPrice,
          },
        ],
      });
    }

    // Logged-in user cart
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
        data: { cartId: cart.id, productId, variantId: variantId ?? null, qty: qty ?? 1, unitPrice },
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
