import { NextResponse } from "next/server";
import { HelpCenterService } from "@/app/lib/services/help-center.service";
import { handleApiError } from "@/app/lib/auth/api";

export async function POST(
  req: Request
) {
  try {
    const {
      id,
      type,
    } = await req.json();

    const count =
      await HelpCenterService.voteArticle(
        id,
        type
      );

    return NextResponse.json({
      success: true,
      count,
    });
  } catch (error) {
    return handleApiError(error);
  }
}