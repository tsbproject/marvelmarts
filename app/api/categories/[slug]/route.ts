import { NextRequest, NextResponse } from "next/server";

import { CategoryService } from "@/app/lib/services/category.service";

import { handleApiError } from "@/app/lib/auth/api";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApiLogging(
  async (
    _req: NextRequest,
    {
      params,
    }: {
      params: Promise<{
        slug: string;
      }>;
    }
  ) => {
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
);