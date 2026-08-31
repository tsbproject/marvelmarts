import { NextResponse } from "next/server";

import { CategoryService } from "@/app/lib/services/category.service";

import { handleApiError } from "@/app/lib/auth/api";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApiLogging(
  async () => {
    try {
      const categories =
        await CategoryService.getCategoryTree();

      return NextResponse.json(
        {
          success: true,
          categories,
        },
        {
          status: 200,
        }
      );
    } catch (error) {
      return handleApiError(error);
    }
  }
);