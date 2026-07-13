import { NextResponse } from "next/server";

import { CategoryService } from "@/app/lib/services/category.service";

import { requireManageCategories } from "@/app/lib/auth/guards";
import { badRequest } from "@/app/lib/auth/errors";
import { handleApiError } from "@/app/lib/auth/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: Request
) {
  try {
    await requireManageCategories();

    const { searchParams } =
      new URL(req.url);

    const slug =
      searchParams.get("slug");

    if (!slug) {
      throw badRequest(
        "Slug required."
      );
    }

    const exists =
      await CategoryService.categorySlugExists(
        slug
      );

    return NextResponse.json({
      exists,
    });
  } catch (error) {
    return handleApiError(error);
  }
}