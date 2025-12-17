import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { cartItemUpdateSchema, cartItemDeleteSchema } from "@/app/lib/schemas/cart";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req: Request) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    const userId = session?.user?.id;
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const parsed = cartItemUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid request payload", errors: parsed.error.format() },
        { status: 400 }
      );
    }

    const { id, qty } = parsed.data;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: String(id) },
      include: { cart: true },
    });

    if (!cartItem || cartItem.cart.userId !== userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    await prisma.cartItem.update({
      where: { id: String(id) },
      data: { qty },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PATCH /api/cart/item error:", err);
    return NextResponse.json({ message: "Failed to update item" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    const userId = session?.user?.id;
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const parsed = cartItemDeleteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid request payload", errors: parsed.error.format() },
        { status: 400 }
      );
    }

    const { id } = parsed.data;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: String(id) },
      include: { cart: true },
    });

    if (!cartItem || cartItem.cart.userId !== userId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    await prisma.cartItem.delete({
      where: { id: String(id) },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/cart/item error:", err);
    return NextResponse.json({ message: "Failed to delete item" }, { status: 500 });
  }
}
