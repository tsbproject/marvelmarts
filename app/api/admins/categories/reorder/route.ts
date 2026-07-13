import { NextRequest, NextResponse } from "next/server";

import { CategoryService } from "@/app/lib/services/category.service";

import { requireManageCategories } from "@/app/lib/auth/guards";
import { handleApiError } from "@/app/lib/auth/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(
  req: NextRequest
) {
  try {
    await requireManageCategories();

    const updates =
      await req.json();

    await CategoryService.reorderCategories(
      updates
    );

    return NextResponse.json(
      {
        success: true,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}