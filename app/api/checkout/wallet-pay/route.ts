import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { Prisma } from "@prisma/client";
// import { prisma } from "@/app/lib/prisma";
import prisma from "@/app/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { amount, items, shippingAddress } = await req.json();

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No checkout items provided" }, { status: 400 });
    }

    const vendorProfileId = items[0]?.vendorProfileId;
    if (!vendorProfileId) {
      return NextResponse.json(
        { error: "Missing vendorProfileId on checkout items" },
        { status: 400 }
      );
    }

    const mixedVendors = items.some(
      (item) => item.vendorProfileId && item.vendorProfileId !== vendorProfileId
    );

    if (mixedVendors) {
      return NextResponse.json(
        { error: "Wallet checkout currently supports one vendor per order" },
        { status: 400 }
      );
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { email: session.user.email! },
        data: {
          walletBalance: { decrement: numericAmount },
        },
      });

      if (Number(user.walletBalance) < 0) {
        throw new Error("Insufficient funds for this transaction");
      }

      const subtotal = new Prisma.Decimal(numericAmount);
      const shipping = new Prisma.Decimal(0);
      const tax = new Prisma.Decimal(0);
      const total = new Prisma.Decimal(numericAmount);

      const order = await tx.order.create({
        data: {
          userId: user.id,
          vendorProfileId,
          subtotal,
          shipping,
          tax,
          total,
          paymentStatus: true,
          paymentTypes: "WALLET",
          status: "pending",

          email: shippingAddress?.email ?? session.user.email ?? null,
          firstName: shippingAddress?.firstName ?? null,
          lastName: shippingAddress?.lastName ?? null,
          phone: shippingAddress?.phone ?? null,
          streetAddress: shippingAddress?.streetAddress ?? null,
          apartment: shippingAddress?.apartment ?? null,
          city: shippingAddress?.city ?? null,
          state: shippingAddress?.state ?? null,

          items: {
          create: items.map((item: any) => ({
            productId: item.productId ?? null,
            variantId: item.variantId ?? null,
            qty: Number(item.quantity) || 1,
            unitPrice: new Prisma.Decimal(Number(item.price) || 0),
            imageUrl: item.imageUrl ?? null,
            title: item.title ?? null,
          })),
        },
        },
      });

      return order;
    });

    return NextResponse.json({ orderId: result.id });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Wallet payment failed" },
      { status: 400 }
    );
  }
}