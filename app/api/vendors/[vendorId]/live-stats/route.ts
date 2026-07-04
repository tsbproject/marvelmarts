import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";

import { requireAuth } from "@/app/lib/auth/guards";
import { handleApiError } from "@/app/lib/auth/api";
import { notFound } from "@/app/lib/auth/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      vendorId: string;
    }>;
  }
) {
  try {
    const { vendorId } =
      await params;

    const session =
      await requireAuth();

    const vendor =
      await prisma.vendorProfile.findUnique({
        where: {
          id: vendorId,
        },
        select: {
          id: true,
          followerCount: true,
          shippingScore: true,
          qualityScore: true,
          avgRating: true,
          cancellationRate: true,
        },
      });

    if (!vendor) {
      throw notFound(
        "Vendor not found."
      );
    }

    const follow =
      await prisma.vendorFollow.findUnique({
        where: {
          userId_vendorProfileId: {
            userId:
              session.user.id,
            vendorProfileId:
              vendorId,
          },
        },
      });

    return NextResponse.json(
      {
        success: true,

        followerCount:
          vendor.followerCount,

        shippingScore:
          vendor.shippingScore,

        qualityScore:
          vendor.qualityScore,

        avgRating:
          vendor.avgRating,

        cancellationRate:
          vendor.cancellationRate,

        isFollowing:
          !!follow,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}