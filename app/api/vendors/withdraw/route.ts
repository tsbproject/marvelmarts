import { NextRequest, NextResponse } from "next/server";
import { handleApiError, requireVendor } from "@/app/lib/auth/api";
import { PayoutService } from "@/app/lib/services/payout.service";
import { badRequest} from "@/app/lib/auth/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest
) {
  try {
    const session =
      await requireVendor();

    const body = await req.json();

    const withdrawAmount = Number(
      body.amount
    );

    if (
      !withdrawAmount ||
      withdrawAmount <= 0
    ) {
      throw badRequest(
        "Invalid withdrawal amount."
      );
    }

    const withdrawal =
      await PayoutService.requestWithdrawal(
        session.user.id,
        withdrawAmount
      );

        
    return NextResponse.json(
      {
        success: true,
        message:
          "Withdrawal initiated successfully.",
        withdrawal,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}