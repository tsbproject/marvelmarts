import { NextResponse } from "next/server";
import { handleApiError } from "@/app/lib/auth/api";
import { ProductService } from "@/app/lib/services/product.service";

export async function GET() {
  try {
    const products =
     await ProductService.getTrendingProducts();

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