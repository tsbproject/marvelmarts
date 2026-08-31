import { NextResponse } from "next/server";

import { handleApiError } from "@/app/lib/auth/api";
import { ProductService } from "@/app/lib/services/product.service";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApiLogging(
  async (request: Request) => {
    try {
      const { searchParams } =
        new URL(request.url);

      const query =
        searchParams.get("q")?.trim() ?? "";

      if (query.length < 2) {
        return NextResponse.json({
          products: [],
          categories: [],
          vendors: [],
        });
      }

      const {
        products,
        categories,
        vendors,
      } = await ProductService.search(query);

      const serializedProducts =
        products.map((product) => ({
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
);