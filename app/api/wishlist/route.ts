import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json([], { status: 200 });
    }

    const wishlistItems = await prisma.wishlist.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          include: {
            images: {
              take: 1,
              orderBy: { order: "asc" },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = wishlistItems.map((item) => ({
      id: item.id,
      productId: item.product.id,
      name: item.product.title,
      slug: item.product.slug,
      price: Number(item.product.price),
      image: item.product.images[0]?.url || "/placeholder-product.png",
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error("WISHLIST GET ERROR:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to load wishlist" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
    });

    if (existing) {
      await prisma.wishlist.delete({ where: { id: existing.id } });
      return NextResponse.json({ action: "removed" });
    }

    await prisma.wishlist.create({
      data: { userId: session.user.id, productId },
    });

    return NextResponse.json({ action: "added" });
  } catch (error: any) {
    console.error("WISHLIST POST ERROR:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update wishlist" },
      { status: 500 }
    );
  }
}




