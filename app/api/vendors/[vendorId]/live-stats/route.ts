import { NextRequest, NextResponse } from "next/server";

import { VendorService } from "@/app/lib/services/vendor.service";

import { handleApiError, getOptionalSession  } from "@/app/lib/auth/api";
import { notFound } from "@/app/lib/auth/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      vendorId: string;
    }>;
  }
) {
  try {
  const { vendorId } = await params;

  const session = await getOptionalSession();

  const userId = session?.user?.id;

  const { vendor, isFollowing } =
    await VendorService.getVendorPublicStats(
      vendorId,
      userId
    );

  if (!vendor) {
    throw notFound("Vendor not found.");
  }

  return NextResponse.json(
    {
      success: true,

      followerCount: vendor.followerCount,

      shippingScore: vendor.shippingScore,

      qualityScore: vendor.qualityScore,

      avgRating: vendor.avgRating,

      cancellationRate: vendor.cancellationRate,

      isFollowing,
    },
    {
      status: 200,
    }
  );
} catch (error) {
  return handleApiError(error);
}
}