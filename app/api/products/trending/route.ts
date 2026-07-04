import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { handleApiError } from "@/app/lib/auth/api";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        isTrending: true,
        status: "ACTIVE",
        vendorProfile: {
          isSuspended: false,
          status: "APPROVED",
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 10,
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        discountPrice: true,
        stock: true,
        images: {
          orderBy: {
            order: "asc",
          },
          take: 1,
          select: {
            url: true,
            alt: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const serializedProducts = products.map((product) => ({
      ...product,
      price: Number(product.price),
      discountPrice:
        product.discountPrice != null
          ? Number(product.discountPrice)
          : null,
      imageUrl: product.images[0]?.url ?? null,
      imageAlt: product.images[0]?.alt ?? null,
    }));

    return NextResponse.json(
      {
        success: true,
        products: serializedProducts,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}