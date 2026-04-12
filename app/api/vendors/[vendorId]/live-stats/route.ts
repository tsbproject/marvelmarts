import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ vendorId: string }> }
) {
  try {
    const { vendorId } = await params;
    const session = await getServerSession(authOptions);

    const vendor = await prisma.vendorProfile.findUnique({
      where: { id: vendorId },
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
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    let isFollowing = false;

    if (session?.user?.id) {
      const follow = await prisma.vendorFollow.findUnique({
        where: {
          userId_vendorProfileId: {
            userId: session.user.id,
            vendorProfileId: vendorId,
          },
        },
      });

      isFollowing = Boolean(follow);
    }

    return NextResponse.json({
      followerCount: vendor.followerCount,
      shippingScore: vendor.shippingScore,
      qualityScore: vendor.qualityScore,
      avgRating: vendor.avgRating,
      cancellationRate: vendor.cancellationRate,
      isFollowing,
    });
  } catch (error) {
    console.error("Vendor live stats error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}