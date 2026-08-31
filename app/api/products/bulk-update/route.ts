import { NextResponse } from "next/server";

import {
  requireAdmin,
  handleApiError,
} from "@/app/lib/auth/api";

import { ProductService } from "@/app/lib/services/product.service";
import { verifyOrigin } from "@/app/lib/auth/csrf";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const PATCH = withApiLogging(
  async (req: Request) => {
    try {
      verifyOrigin(req);

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
);