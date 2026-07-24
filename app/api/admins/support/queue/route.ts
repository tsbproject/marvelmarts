import { NextResponse } from "next/server";

import { MessageService } from "@/app/lib/services/message.service";
import { handleApiError, requireManageSupport } from "@/app/lib/auth/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireManageSupport();

    const result =
      await MessageService.getSupportDashboardStats();

    return NextResponse.json({
      success: true,
      openTickets:
        result.openTickets,
    });
  } catch (error) {
    return handleApiError(error);
  }
}