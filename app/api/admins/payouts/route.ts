import { NextResponse } from "next/server";

import { PayoutService } from "@/app/lib/services/payout.service";

import { handleApiError, requireManagePayout } from "@/app/lib/auth/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireManagePayout();

    const payouts =
      await PayoutService.getAdminPayouts();

    return NextResponse.json(
      {
        success: true,
        payouts,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}