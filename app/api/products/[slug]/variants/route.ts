import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  handleApiError,
  requireVendor,
} from "@/app/lib/auth/api";

import {
  badRequest,
} from "@/app/lib/auth/errors";

import { requireProductOwnershipBySlug } from "@/app/lib/products/ownership";
import { ProductService } from "@/app/lib/services/product.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* -------------------------------------------------------------------------- */
/* SCHEMA                                                                     */
/* -------------------------------------------------------------------------- */

const attributesSchema = z.record(
  z.string(),
  z.string()
);

export const variantSchema = z.object({
  name: z.string().min(1),
  price: z.number().nonnegative().optional(),
  stock: z.number().int().nonnegative().optional(),
  attributes: attributesSchema.optional(),
});

/* -------------------------------------------------------------------------- */
/* SERIALIZER                                                                 */
/* -------------------------------------------------------------------------- */

function serializeVariant(
  variant: any
) {
  return {
    ...variant,
    price:
      variant.price != null
        ? Number(variant.price)
        : null,
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

 const variants =
  await ProductService.getProductVariants(
    slug
  );

return NextResponse.json({
  success: true,
  variants: variants.map(
    serializeVariant
  ),
});
    
  } catch (error) {
    return handleApiError(error);
  }
}

/* -------------------------------------------------------------------------- */
/* POST                                                                        */
/* -------------------------------------------------------------------------- */

export async function POST(
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

    const { slug } =
      await params;

    const product =
      await requireProductOwnershipBySlug(
        slug,
        session
      );

    const body =
      await request.json();

    const parsed =
      variantSchema.parse(body);

      const variant =
      await ProductService.createVariant(
        product.id,
        parsed
      );

    return NextResponse.json(
      {
        success: true,
        variant:
          serializeVariant(
            variant
          ),
      },
      {
        status: 201,
      }
    );
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

    const { slug } =
      await params;

    await requireProductOwnershipBySlug(
      slug,
      session
    );

    const { searchParams } =
      new URL(request.url);

    const variantId =
      searchParams.get("id");

    if (!variantId) {
      throw badRequest(
        "Variant ID is required."
      );
    }

  await ProductService.deleteVariant(
      variantId
    );

  

    return NextResponse.json({
      success: true,
      message:
        "Variant deleted successfully.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}