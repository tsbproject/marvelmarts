import { NextResponse } from "next/server";

import { HelpCenterService } from "@/app/lib/services/help-center.service";

import { handleApiError } from "@/app/lib/auth/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request
) {
  try {
    const { searchParams } =
      new URL(request.url);

    const query =
      searchParams
        .get("q")
        ?.trim() ?? "";

    const articles =
      await HelpCenterService.searchArticles(
        query
      );

    return NextResponse.json({
      success: true,
      articles,
    });
  } catch (error) {
    return handleApiError(error);
  }
}