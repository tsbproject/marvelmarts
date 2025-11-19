// import { prisma } from "@/app/_lib/prisma";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/_lib/auth";
// import { NextResponse } from "next/server";

// // GET all orders for user
// export async function GET() {
//   try {
//     const session = await getServerSession(authOptions);
//     const userId = (session?.user as any)?.id;
//     if (!userId) return new NextResponse("Unauthorized", { status: 401 });

//     const orders = await prisma.order.findMany({
//       where: { userId },
//       include: { items: { include: { product: true, variant: true } } },
//       orderBy: { createdAt: "desc" },
//     });

//     return NextResponse.json(orders);
//   } catch (err) {
//     console.error("GET /api/orders error:", err);
//     return NextResponse.json({ message: "Failed to fetch orders" }, { status: 500 });
//   }
// }

// // POST create order from cart
// export async function POST() {
//   try {
//     const session = await getServerSession(authOptions);
//     const userId = (session?.user as any)?.id;
//     if (!userId) return new NextResponse("Unauthorized", { status: 401 });

//     const cart = await prisma.cart.findUnique({
//       where: { userId },
//       include: { items: true },
//     });

//     if (!cart || cart.items.length === 0)
//       return NextResponse.json({ message: "Cart is empty" }, { status: 400 });

//     const subtotal = cart.items.reduce((acc, i) => acc + Number(i.unitPrice) * i.qty, 0);
//     const tax = 0;
//     const shipping = 0;
//     const total = subtotal + tax + shipping;

//     const order = await prisma.order.create({
//       data: {
//         userId,
//         subtotal,
//         tax,
//         shipping,
//         total,
//         items: { create: cart.items.map(i => ({ productId: i.productId, variantId: i.variantId, qty: i.qty, unitPrice: i.unitPrice })) },
//       },
//       include: { items: true },
//     });

//     await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

//     return NextResponse.json(order);
//   } catch (err) {
//     console.error("POST /api/orders error:", err);
//     return NextResponse.json({ message: "Failed to create order" }, { status: 500 });
//   }
// }


import { prisma } from "@/app/_lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/_lib/auth";
import { NextResponse } from "next/server";
import type { User } from "next-auth";

// GET all orders for the authenticated user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as User | undefined;
    const userId = user?.id as string | undefined;

    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const orders = await prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true, variant: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (err) {
    console.error("GET /api/orders error:", err);
    return NextResponse.json(
      { message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST: create order from cart
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as User | undefined;
    const userId = user?.id as string | undefined;

    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (!cart || cart.items.length === 0)
      return NextResponse.json(
        { message: "Cart is empty" },
        { status: 400 }
      );

    const subtotal = cart.items.reduce(
      (acc, i) => acc + Number(i.unitPrice) * i.qty,
      0
    );
    const tax = 0;
    const shipping = 0;
    const total = subtotal + tax + shipping;

    const order = await prisma.order.create({
      data: {
        userId,
        subtotal,
        tax,
        shipping,
        total,
        items: {
          create: cart.items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            qty: i.qty,
            unitPrice: i.unitPrice,
          })),
        },
      },
      include: { items: true },
    });

    // Clear the user's cart
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    return NextResponse.json(order);
  } catch (err) {
    console.error("POST /api/orders error:", err);
    return NextResponse.json(
      { message: "Failed to create order" },
      { status: 500 }
    );
  }
}


