import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json([], { status: 200 });

  const wishlistItems = await prisma.wishlist.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        include: {
          images: { take: 1, orderBy: { order: 'asc' } }
        }
      }
    }
  });

  // Format to match your WishlistItem interface
  const formatted = wishlistItems.map((item) => ({
    id: item.id,
    productId: item.product.id,
    name: item.product.title,
    slug: item.product.slug,
    price: Number(item.product.price),
    image: item.product.images[0]?.url || "/placeholder-product.png",
  }));

  return NextResponse.json(formatted);
}