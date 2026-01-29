import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface AddToCartBody {
  productId: string;
  variantId?: string | null;
  qty?: number;
}

// Helper: Standardize decimal-to-number conversion
function formatCart(cart: any) {
  return {
    id: cart.id,
    userId: cart.userId,
    items: cart.items.map((item: any) => ({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId,
      qty: item.qty,
      unitPrice: Number(item.unitPrice),
      product: item.product ? {
        ...item.product,
        price: Number(item.product.price),
        discountPrice: item.product.discountPrice ? Number(item.product.discountPrice) : null,
      } : null,
      variant: item.variant ? { 
        id: item.variant.id, 
        name: item.variant.name,
        stock: item.variant.stock // Important for frontend validation
      } : null,
    })),
  };
}

async function getOrCreateCart(userId: string) {
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
  return formatCart(cart);
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ items: [] });
    
    const cart = await getOrCreateCart(session.user.id);
    return NextResponse.json(cart);
  } catch (error) {
    return NextResponse.json({ error: "Failed to load cart" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const { productId, variantId, qty = 1 }: AddToCartBody = await req.json();

    if (!productId) return NextResponse.json({ error: "Product ID required" }, { status: 400 });

    // 1. Fetch Product and optional Variant to determine price & check stock
    const product = await prisma.product.findUnique({ 
      where: { id: productId },
      include: { variants: variantId ? { where: { id: variantId } } : false }
    });

    if (!product) return NextResponse.json({ error: "Invalid product" }, { status: 404 });

    // 2. Determine Price and Stock
    let finalUnitPrice: Prisma.Decimal;
    let availableStock: number;

    if (variantId) {
      const variant = (product as any).variants?.[0];
      if (!variant) return NextResponse.json({ error: "Variant not found" }, { status: 404 });
      finalUnitPrice = variant.price ?? (product.discountPrice ?? product.price);
      availableStock = variant.stock;
    } else {
      finalUnitPrice = product.discountPrice ?? product.price;
      availableStock = product.stock;
    }

    // 3. Stock Validation
    if (availableStock < qty) {
      return NextResponse.json({ error: "Insufficient stock" }, { status: 400 });
    }

    if (!userId) {
      // Guest Logic (Returns mock item for local storage use)
      return NextResponse.json({
        id: "guest",
        items: [{ 
          id: Date.now().toString(), 
          productId, 
          variantId, 
          qty, 
          unitPrice: Number(finalUnitPrice),
          product: { title: product.title } 
        }]
      });
    }

    // 4. DB Sync for Logged-in Users
    const cart = await getOrCreateCart(userId);

    // Check if THIS specific product/variant combo already exists in the cart
    const existingItem = await prisma.cartItem.findFirst({
      where: { 
        cartId: cart.id!, 
        productId, 
        variantId: variantId ?? null 
      },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { qty: existingItem.qty + qty },
      });
    } else {
      await prisma.cartItem.create({
        data: { 
          cartId: cart.id!, 
          productId, 
          variantId: variantId ?? null, 
          qty, 
          unitPrice: finalUnitPrice 
        },
      });
    }

    const updatedCart = await getOrCreateCart(userId);
    return NextResponse.json(updatedCart);
  } catch (error) {
    console.error("POST /api/cart error:", error);
    return NextResponse.json({ error: "Failed to add item" }, { status: 500 });
  }
}