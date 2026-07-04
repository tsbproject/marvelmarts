import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";

import { requireVendor } from "@/app/lib/auth/guards";
import { handleApiError } from "@/app/lib/auth/api";
import {
  badRequest,
  forbidden,
  notFound,
} from "@/app/lib/auth/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* -------------------------------------------------------------------------- */
/*                           GET MY PRODUCTS                                  */
/* -------------------------------------------------------------------------- */

export async function GET() {
  try {
    const session = await requireVendor();

    const vendor = await prisma.vendorProfile.findUnique({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
      },
    });

    if (!vendor) {
      throw notFound(
        "Vendor profile not found."
      );
    }

    const products = await prisma.product.findMany({
      where: {
        vendorProfileId: vendor.id,
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
        images: {
          select: {
            url: true,
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      {
        success: true,
        items: products.map((product) => ({
          ...product,
          name:
            product.title ||
            "Untitled Product",
            imageUrl:
            product.images?.[0]?.url ||
            "/logo.png",
        })),
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/* -------------------------------------------------------------------------- */
/*                           DELETE PRODUCT                                   */
/* -------------------------------------------------------------------------- */

export async function DELETE(
  req: NextRequest
) {
  try {
    const session =
      await requireVendor();

    const productId =
      new URL(req.url).searchParams.get(
        "id"
      );

    if (!productId) {
      throw badRequest(
        "Product ID is required."
      );
    }

    const vendor =
      await prisma.vendorProfile.findUnique({
        where: {
          userId: session.user.id,
        },
        select: {
          id: true,
        },
      });

    if (!vendor) {
      throw notFound(
        "Vendor profile not found."
      );
    }

    const product =
      await prisma.product.findUnique({
        where: {
          id: productId,
        },
        select: {
          id: true,
          vendorProfileId: true,
        },
      });

    if (!product) {
      throw notFound(
        "Product not found."
      );
    }

    if (
      product.vendorProfileId !==
      vendor.id
    ) {
      throw forbidden(
        "You do not have permission to delete this product."
      );
    }

    await prisma.product.delete({
      where: {
        id: productId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Product deleted successfully.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}