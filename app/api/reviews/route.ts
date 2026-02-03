// app/api/reviews/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const { productId, rating, body } = await req.json();

    // 1. TACTICAL CHECK: Verify Purchase
    // Search for a delivered order belonging to this user that contains this product
    const purchased = await prisma.order.findFirst({
      where: {
        userId: session.user.id,
        status: "DELIVERED",
        items: {
          some: { productId: productId }
        }
      }
    });

    // 2. Create Review with the verification intel
    const review = await prisma.review.create({
      data: {
        productId,
        userId: session.user.id,
        rating: Number(rating),
        body,
        isVerified: !!purchased, // true if order found, false otherwise
        approved: true,
      },
      include: {
        user: { select: { name: true } }
      }
    });

    return NextResponse.json(review);
  } catch (error: any) {
    console.error("REVIEW_POST_ERROR:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}