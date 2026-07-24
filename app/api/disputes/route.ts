import { NextRequest, NextResponse } from "next/server";
import { handleApiError, requireAuth } from "@/app/lib/auth/api";
import { badRequest } from "@/app/lib/auth/errors";
import { DisputeService } from "@/app/lib/services/dispute.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();

    const {
      orderId,
      reason,
      description,
      vendorName,
      vendorProfileId,
    } = await req.json();

    if (
      !orderId ||
      !reason ||
      !vendorProfileId
    ) {
      throw badRequest(
        "Order, vendor and dispute reason are required."
      );
    }

    const dispute =
  await DisputeService.createDispute({
    orderId,
    vendorProfileId,
    vendorName,
    reason,
    description,
    raisedById: session.user.id,
  });

return NextResponse.json(
  {
    success: true,
    disputeId: dispute.id,
  },
  {
    status: 201,
  }
);
  } catch (error) {
    return handleApiError(error);
  }
}