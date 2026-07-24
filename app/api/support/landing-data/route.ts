import { NextResponse } from "next/server";

import { handleApiError } from "@/app/lib/auth/api";
import { HelpCenterService } from "@/app/lib/services/help-center.service";

export async function GET() {
  try {
    const data =
      await HelpCenterService.getHelpCenterHome();

    return NextResponse.json(
      data
    );
  } catch (error) {
    return handleApiError(error);
  }
}