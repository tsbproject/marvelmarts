import { NextResponse } from "next/server";

import { requireAdmin, handleApiError,} from "@/app/lib/auth/api";

import { ProductService } from "@/app/lib/services/product.service";

export async function PATCH(req: Request) {
  try {
    await requireAdmin();

    const {
      ids = [],
      updateType,
      applyToAll = false,
      filters,
    } = await req.json();

    const result =
      await ProductService.bulkToggleProductFlag({
        ids,
        updateType,
        applyToAll,
        filters,
      });

    return NextResponse.json({
      success: true,
      message: `Updated ${result.count} products.`,
      affectedIds: result.affectedIds,
    });
  } catch (error) {
    return handleApiError(error);
  }
}