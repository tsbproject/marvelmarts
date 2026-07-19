import { NextRequest, NextResponse } from "next/server";

import { CategoryService } from "@/app/lib/services/category.service";

import { handleApiError } from "@/app/lib/auth/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest
) {
  try {
    const query =
      req.nextUrl.searchParams
        .get("q")
        ?.trim() ?? "";

    const categories =
      await CategoryService.searchCategories(
        query
      );

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