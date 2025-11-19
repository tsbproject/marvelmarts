import { prisma } from "@/app/_lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/_lib/auth";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { id, qty } = await req.json();

    const cartItem = await prisma.cartItem.findUnique({ where: { id }, include: { cart: true } });
    if (!cartItem || cartItem.cart.userId !== userId)
      return new NextResponse("Forbidden", { status: 403 });

    await prisma.cartItem.update({ where: { id }, data: { qty } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PATCH /api/cart/item error:", err);
    return NextResponse.json({ message: "Failed to update item" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = await req.json();

    const cartItem = await prisma.cartItem.findUnique({ where: { id }, include: { cart: true } });
    if (!cartItem || cartItem.cart.userId !== userId)
      return new NextResponse("Forbidden", { status: 403 });

    await prisma.cartItem.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/cart/item error:", err);
    return NextResponse.json({ message: "Failed to delete item" }, { status: 500 });
  }
}






// import { supabase } from "@/app/_lib/db";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/_lib/auth";
// import { NextResponse } from "next/server";


// export async function PATCH(req: Request) {
// const session = await getServerSession(authOptions);
// if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
// const { id, qty } = await req.json();
// await supabase.cartItem.update({ where: { id }, data: { qty } });
// return NextResponse.json({ ok: true });
// }


// export async function DELETE(req: Request) {
// const session = await getServerSession(authOptions);
// if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
// const { id } = await req.json();
// await supabase.cartItem.delete({ where: { id } });
// return NextResponse.json({ ok: true });
// }