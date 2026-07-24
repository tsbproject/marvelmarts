import { NextRequest, NextResponse } from "next/server";

import { ProductService } from "@/app/lib/services/product.service";

import { handleApiError, requireAuth  } from "@/app/lib/auth/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest
) {
  try {
    const session =
      await requireAuth();

    const body =
      await req.json();

    const review =
      await ProductService.createProductReview(
        session.user.id,
        {
          productId:
            body.productId,

          rating:
            Number(body.rating),

          body:
            body.body,
        }
      );

    return NextResponse.json(
      {
        success: true,
        review,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}