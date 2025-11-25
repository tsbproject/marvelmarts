import { NextResponse } from "next/server";
import  prisma  from "@/app/_lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/_lib/auth";

interface SessionUser {
  id: string; // id is a string according to the Prisma schema
  name?: string | null;
  email?: string | null;
}

interface AddToCartBody {
  productId: string; // id is a string in Prisma schema
  variantId?: string | null; // id is a string in Prisma schema
  qty?: number;
}

interface CartItem {
  id: string; // id is a string in Prisma schema
  product: {
    id: string; // id is a string in Prisma schema
    title: string;
    discountPrice?: number | null; // converted to number
    price: number; // converted to number
  } | null;
  variant: { id: string; name?: string } | null;
  qty: number;
  unitPrice: number; // unitPrice should be a number
}

interface Cart {
  id: string | null; // id is a string in Prisma schema
  userId: string | null; // userId is a string in Prisma schema
  items: CartItem[]; // List of CartItems
}

// Helper function to get or create a cart
async function getOrCreateCart(userId: string | null): Promise<Cart> {
  if (userId) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true, variant: true } } },
    });

    if (cart) {
      // Convert Decimal to number for `price`, `discountPrice`, and `unitPrice` when returning the cart
      const result: Cart = {
        id: cart.id,
        userId: cart.userId,
        items: cart.items.map(item => ({
          id: item.id,
          product: item.product ? {
            ...item.product,
            price: parseFloat(item.product.price.toString()), // Convert Decimal to number
            discountPrice: item.product.discountPrice ? parseFloat(item.product.discountPrice.toString()) : null, // Convert Decimal to number
          } : null,
          variant: item.variant ? { id: item.variant.id, name: item.variant.name } : null,
          qty: item.qty,
          unitPrice: parseFloat(item.unitPrice.toString()),
        })),
      };

      return result;
    }

    // If no cart found, create a new one
    const created = await prisma.cart.create({
      data: { userId },
      include: { items: { include: { product: true, variant: true } } },
    });

    return {
      id: created.id,
      userId: created.userId,
      items: created.items.map(item => ({
        id: item.id,
        product: item.product ? {
          ...item.product,
          price: parseFloat(item.product.price.toString()),
          discountPrice: item.product.discountPrice ? parseFloat(item.product.discountPrice.toString()) : null,
        } : null,
        variant: item.variant ? { id: item.variant.id, name: item.variant.name } : null,
        qty: item.qty,
        unitPrice: parseFloat(item.unitPrice.toString()),
      })),
    };
  }

  // Return a default cart if no userId
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
    return NextResponse.json({ error: "Failed to load cart" }, { status: 500 });
  }
}

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
      // Guest cart logic
      return NextResponse.json({
        id: null,
        userId: null,
        items: [
          {
            id: Date.now().toString(), // Convert to string for guest cart ID
            product,
            variant: variantId ? { id: variantId } : null,
            qty: qty ?? 1,
            unitPrice,
          },
        ],
      });
    }

    const cart = await getOrCreateCart(userId);

    if (!cart.id) {
      return NextResponse.json({ error: "Cart ID is missing" }, { status: 500 });
    }
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, variantId: variantId ?? null, qty: qty ?? 1, unitPrice },
    });

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { product: true, variant: true } } },
    });

    if (!updatedCart) {
      return NextResponse.json({ error: "Cart not found after update" }, { status: 404 });
    }

    // Convert Decimal to number for the cart items before returning
    const result: Cart = {
      id: updatedCart.id,
      userId: updatedCart.userId,
      items: updatedCart.items.map(item => ({
        id: item.id,
        product: item.product ? {
          ...item.product,
          price: parseFloat(item.product.price.toString()), // Convert Decimal to number
          discountPrice: item.product.discountPrice ? parseFloat(item.product.discountPrice.toString()) : null, // Convert Decimal to number
        } : null,
        variant: item.variant ? { id: item.variant.id, name: item.variant.name } : null,
        qty: item.qty,
        unitPrice: parseFloat(item.unitPrice.toString()),
      })),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("POST /api/cart error:", error);
    return NextResponse.json({ error: "Failed to add item" }, { status: 500 });
  }
}
