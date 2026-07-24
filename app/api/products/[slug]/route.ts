import { NextRequest, NextResponse } from "next/server";

import { productSchema } from "@/app/lib/validations/product";

import {
  requireVendor,
  handleApiError,
} from "@/app/lib/auth/api";

import {ProductService,} from "@/app/lib/services/product.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* -------------------------------------------------------------------------- */
/* SERIALIZER                                                                 */
/* -------------------------------------------------------------------------- */

function serializeProduct(product: any) {
  return {
    ...product,
    price: Number(product.price),
    discountPrice:
      product.discountPrice != null
        ? Number(product.discountPrice)
        : null,

    variants:
      product.variants?.map((variant: any) => ({
        ...variant,
        price:
          variant.price != null
            ? Number(variant.price)
            : null,
      })) ?? [],
  };
}

/* -------------------------------------------------------------------------- */
/* GET                                                                         */
/* -------------------------------------------------------------------------- */

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      slug: string;
    }>;
  }
) {
  try {
    const { slug } = await params;

    const product =
      await ProductService.getProductBySlug(
        slug
      );

    return NextResponse.json({
      success: true,
      product: serializeProduct(product),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/* -------------------------------------------------------------------------- */
/* PUT                                                                         */
/* -------------------------------------------------------------------------- */

export async function PUT(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      slug: string;
    }>;
  }
) {
  try {
    const session =
      await requireVendor();

    const { slug } = await params;

    const body =
      await request.json();

    const parsed =
      productSchema.parse(body);

    const product =
      await ProductService.updateProductBySlug(
        slug,
        session.user.id,
        session.user.role,
        parsed
      );

    return NextResponse.json({
      success: true,
      product: serializeProduct(product),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/* -------------------------------------------------------------------------- */
/* DELETE                                                                      */
/* -------------------------------------------------------------------------- */

export async function DELETE(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      slug: string;
    }>;
  }
) {
  try {
    const session =
      await requireVendor();

    const { slug } = await params;

    await ProductService.deleteProductBySlug(
      slug,
      session.user.id,
      session.user.role
    );

    return NextResponse.json({
      success: true,
      message:
        "Product deleted successfully.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}