import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";

import { requireAuth } from "@/app/lib/auth/guards";
import { handleApiError } from "@/app/lib/auth/api";
import {
  badRequest,
  notFound,
} from "@/app/lib/auth/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
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
    const session =
      await requireAuth();

    const { vendorId } =
      await params;

    const body = await req.json();

    const action =
      String(body.action ?? "")
        .trim()
        .toLowerCase();

    if (
      action !== "follow" &&
      action !== "unfollow"
    ) {
      throw badRequest(
        "Invalid follow action."
      );
    }

    const vendor =
      await prisma.vendorProfile.findUnique({
        where: {
          id: vendorId,
        },
        select: {
          id: true,
        },
      });

    if (!vendor) {
      throw notFound(
        "Vendor not found."
      );
    }

    const existingFollow =
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

    if (
      action === "follow" &&
      !existingFollow
    ) {
      await prisma.$transaction([
        prisma.vendorFollow.create({
          data: {
            userId:
              session.user.id,
            vendorProfileId:
              vendorId,
          },
        }),

        prisma.vendorProfile.update({
          where: {
            id: vendorId,
          },
          data: {
            followerCount: {
              increment: 1,
            },
          },
        }),
      ]);
    }

    if (
      action === "unfollow" &&
      existingFollow
    ) {
      await prisma.$transaction([
        prisma.vendorFollow.delete({
          where: {
            userId_vendorProfileId: {
              userId:
                session.user.id,
              vendorProfileId:
                vendorId,
            },
          },
        }),

        prisma.vendorProfile.update({
          where: {
            id: vendorId,
          },
          data: {
            followerCount: {
              decrement: 1,
            },
          },
        }),
      ]);
    }

    const [
      updatedVendor,
      follow,
    ] = await Promise.all([
      prisma.vendorProfile.findUnique({
        where: {
          id: vendorId,
        },
        select: {
          followerCount: true,
        },
      }),

      prisma.vendorFollow.findUnique({
        where: {
          userId_vendorProfileId: {
            userId:
              session.user.id,
            vendorProfileId:
              vendorId,
          },
        },
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        isFollowing:
          !!follow,
        followerCount:
          updatedVendor?.followerCount ??
          0,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}