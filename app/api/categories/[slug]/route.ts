import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";

import { handleApiError } from "@/app/lib/auth/api";
import { notFound } from "@/app/lib/auth/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      slug: string;
    }>;
  }
) {
  try {
    const { slug } =
      await params;

    const category =
      await prisma.category.findUnique({
        where: {
          slug,
        },
        include: {
          products: {
            include: {
              images: true,
              variants: true,
            },
          },
          children: {
            orderBy: {
              position: "asc",
            },
          },
        },
      });

    if (!category) {
      throw notFound(
        "Category not found."
      );
    }

    return NextResponse.json(
      {
        success: true,
        category: {
          ...category,
          products:
            category.products.map(
              (product) => ({
                ...product,
                price: Number(
                  product.price
                ),
                discountPrice:
                  product.discountPrice
                    ? Number(
                        product.discountPrice
                      )
                    : null,
                variants:
                  product.variants.map(
                    (variant) => ({
                      ...variant,
                      price: Number(
                        variant.price
                      ),
                    })
                  ),
              })
            ),
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}