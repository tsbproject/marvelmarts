import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ vendorId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { vendorId } = await params;
    const body = await req.json();
    const action = body?.action;

    if (!vendorId) {
      return NextResponse.json({ error: "Vendor ID is required" }, { status: 400 });
    }

    const vendor = await prisma.vendorProfile.findUnique({
      where: { id: vendorId },
      select: { id: true },
    });

    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
    }

    const existingFollow = await prisma.vendorFollow.findUnique({
      where: {
        userId_vendorProfileId: {
          userId: session.user.id,
          vendorProfileId: vendorId,
        },
      },
    });

    if (action === "follow" && !existingFollow) {
      await prisma.$transaction([
        prisma.vendorFollow.create({
          data: {
            userId: session.user.id,
            vendorProfileId: vendorId,
          },
        }),
        prisma.vendorProfile.update({
          where: { id: vendorId },
          data: {
            followerCount: {
              increment: 1,
            },
          },
        }),
      ]);
    }

    if (action === "unfollow" && existingFollow) {
      await prisma.$transaction([
        prisma.vendorFollow.delete({
          where: {
            userId_vendorProfileId: {
              userId: session.user.id,
              vendorProfileId: vendorId,
            },
          },
        }),
        prisma.vendorProfile.update({
          where: { id: vendorId },
          data: {
            followerCount: {
              decrement: 1,
            },
          },
        }),
      ]);
    }

    const updatedVendor = await prisma.vendorProfile.findUnique({
      where: { id: vendorId },
      select: { followerCount: true },
    });

    const stillFollowing = await prisma.vendorFollow.findUnique({
      where: {
        userId_vendorProfileId: {
          userId: session.user.id,
          vendorProfileId: vendorId,
        },
      },
    });

    return NextResponse.json({
      isFollowing: Boolean(stillFollowing),
      followerCount: updatedVendor?.followerCount ?? 0,
    });
  } catch (error) {
    console.error("Follow toggle error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}