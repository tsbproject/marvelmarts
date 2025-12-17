// import prisma  from "@/app/lib/prisma";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/lib/auth";
// import { NextResponse } from "next/server";
// import type { SessionWithUserId } from "@/app/lib/auth"; // Import the type we defined earlier

// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";


// export async function PATCH(req: Request) {
//   try {
//     const session = (await getServerSession(authOptions)) as SessionWithUserId | null;
//     const userId = session?.user?.id;
//     if (!userId) return new NextResponse("Unauthorized", { status: 401 });

//     const { id, qty }: { id: number; qty: number } = await req.json();

//     // Convert id to string
//     const cartItem = await prisma.cartItem.findUnique({
//       where: { id: String(id) }, // Ensure id is a string
//       include: { cart: true },
//     });

//     if (!cartItem || cartItem.cart.userId !== userId)
//       return new NextResponse("Forbidden", { status: 403 });

//     await prisma.cartItem.update({ where: { id: String(id) }, data: { qty } }); // Ensure id is a string

//     return NextResponse.json({ ok: true });
//   } catch (err) {
//     console.error("PATCH /api/cart/item error:", err);
//     return NextResponse.json({ message: "Failed to update item" }, { status: 500 });
//   }
// }

// export async function DELETE(req: Request) {
//   try {
//     const session = (await getServerSession(authOptions)) as SessionWithUserId | null;
//     const userId = session?.user?.id;
//     if (!userId) return new NextResponse("Unauthorized", { status: 401 });

//     const { id }: { id: number } = await req.json();

//     // Convert id to string
//     const cartItem = await prisma.cartItem.findUnique({
//       where: { id: String(id) }, // Ensure id is a string
//       include: { cart: true },
//     });

//     if (!cartItem || cartItem.cart.userId !== userId)
//       return new NextResponse("Forbidden", { status: 403 });

//     await prisma.cartItem.delete({ where: { id: String(id) } }); // Ensure id is a string

//     return NextResponse.json({ ok: true });
//   } catch (err) {
//     console.error("DELETE /api/cart/item error:", err);
//     return NextResponse.json({ message: "Failed to delete item" }, { status: 500 });
//   }
// }

import prisma from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// --- Zod schemas ---
const patchSchema = z.object({
  id: z.number().int().positive(),
  qty: z.number().int().min(1),
});

const deleteSchema = z.object({
  id: z.number().int().positive(),
});

export async function PATCH(req: Request) {
  try {
    const session = (await getServerSession(authOptions)) as Session | null;
    const userId = session?.user?.id;
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    // ✅ Validate request body
    const body = await req.json();
    const parsed = patchSchema.safeParse(body);
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

    // ✅ Validate request body
    const body = await req.json();
    const parsed = deleteSchema.safeParse(body);
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
