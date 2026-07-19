import { NextRequest, NextResponse } from "next/server";

import { CategoryService } from "@/app/lib/services/category.service";

import { handleApiError } from "@/app/lib/auth/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      slug: string;
    }>;
  }
) {
  try {
    const { slug } =
      await params;

    const category =
      await CategoryService.getCategoryBySlug(
        slug
      );

    return NextResponse.json(
      {
        success: true,
        category,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}