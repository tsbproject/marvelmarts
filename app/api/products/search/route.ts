import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { badRequest } from "@/app/lib/auth/errors";
import { handleApiError } from "@/app/lib/auth/api";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() ?? "";

    if (query.length < 2) {
      return NextResponse.json({
        products: [],
        categories: [],
        vendors: [],
      });
    }

    const [products, categories, vendors] = await Promise.all([
      prisma.product.findMany({
        where: {
          status: "ACTIVE",
          isPublished: true,
          vendorProfile: {
            isSuspended: false,
            status: "APPROVED",
          },
          OR: [
            {
              title: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              sku: {
                contains: query,
                mode: "insensitive",
              },
            },
          ],
        },
        include: {
          images: {
            take: 1,
            orderBy: {
              order: "asc",
            },
          },
         vendorProfile: {
            select: {
              id: true,
              storeName: true,
              logoUrl: true,
              isVerified: true,
            },
          },
        },
        orderBy: [
          {
            boostUntil: {
              sort: "desc",
              nulls: "last",
            },
          },
          {
            createdAt: "desc",
          },
        ],
        take: 10,
      }),

      prisma.category.findMany({
        where: {
          name: {
            contains: query,
            mode: "insensitive",
          },
        },
        orderBy: {
          name: "asc",
        },
        take: 4,
      }),

      prisma.vendorProfile.findMany({
        where: {
          isSuspended: false,
          status: "APPROVED",
          OR: [
            {
              storeName: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              id: {
                equals: query,
              },
            },
          ],
        },
        select: {
          id: true,
          storeName: true,
          logoUrl: true,
          isVerified: true,
        },
        take: 3,
      }),
    ]);

    const serializedProducts = products.map((product) => ({
      ...product,
      price: Number(product.price),
      discountPrice:
        product.discountPrice != null
          ? Number(product.discountPrice)
          : null,
    }));

    return NextResponse.json({
      success: true,
      products: serializedProducts,
      categories,
      vendors,
    });
  } catch (error) {
    return handleApiError(error);
  }
}