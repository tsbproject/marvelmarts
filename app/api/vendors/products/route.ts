import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";

import { requireVendor } from "@/app/lib/auth/guards";
import { handleApiError } from "@/app/lib/auth/api";
import { VendorService } from "@/app/lib/services/vendor.service";
import { ProductService } from "@/app/lib/services/product.service";
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

    const vendor =
      await VendorService.getVendorProfileOrThrow(
        session.user.id
      );
    
     const products =
      await ProductService.getVendorProducts(
        vendor.id
      );

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
      await ProductService.getProductByIdOrThrow(
        productId
      );

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

    await ProductService.deleteProductById(
          productId
        );

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