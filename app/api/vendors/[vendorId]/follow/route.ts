import { NextRequest, NextResponse } from "next/server";

import {
  handleApiError,
  requireAuth,
} from "@/app/lib/auth/api";

import { VendorService } from "@/app/lib/services/vendor.service";

import {
  badRequest,
  notFound,
} from "@/app/lib/auth/errors";

import { verifyOrigin } from "@/app/lib/auth/csrf";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = withApiLogging(
  async (
    req: NextRequest,
    {
      params,
    }: {
      params: Promise<{
        vendorId: string;
      }>;
    }
  ) => {
    try {
      verifyOrigin(req);

      const session =
        await requireAuth();

      const { vendorId } =
        await params;

      const body =
        await req.json();

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

      const result =
        await VendorService.updateVendorFollow(
          vendorId,
          session.user.id,
          action
        );

      if (!result.vendorExists) {
        throw notFound(
          "Vendor not found."
        );
      }

      return NextResponse.json(
        {
          success: true,
          isFollowing:
            result.isFollowing,
          followerCount:
            result.followerCount,
        },
        {
          status: 200,
        }
      );
    } catch (error) {
      return handleApiError(error);
    }
  }
);