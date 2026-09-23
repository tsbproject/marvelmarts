import { NextResponse } from "next/server";

import {
  handleApiError,
  requireManagePayout,
} from "@/app/lib/auth/api";

import { verifyOrigin } from "@/app/lib/auth/csrf";

import { withApiLogging } from "@/app/lib/logging/with-api-logging";

import { VendorSettlementService } from "@/app/lib/services/finance/vendor-settlement.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SORT_FIELDS = new Set([
  "payableCreated",
  "settled",
  "outstanding",
  "lastActivity",
]);

const SORT_ORDERS = new Set([
  "asc",
  "desc",
]);

export const GET = withApiLogging(
  async (req: Request) => {
    try {
      verifyOrigin(req);

      await requireManagePayout();

      const url = new URL(req.url);

      const pageParam =
        url.searchParams.get("page");

      const limitParam =
        url.searchParams.get("limit");

      const search =
        url.searchParams.get("search") ??
        "";

      const sortByParam =
        url.searchParams.get("sortBy") ??
        "outstanding";

      const sortOrderParam =
        url.searchParams.get("sortOrder") ??
        "desc";

      const page =
        pageParam === null
          ? 1
          : Number(pageParam);

      const limit =
        limitParam === null
          ? 25
          : Number(limitParam);

      if (
        !Number.isInteger(page) ||
        page < 1
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Page must be a positive integer.",
          },
          { status: 400 }
        );
      }

      if (
        !Number.isInteger(limit) ||
        limit < 1 ||
        limit > 100
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Limit must be between 1 and 100.",
          },
          { status: 400 }
        );
      }

      if (
        !SORT_FIELDS.has(sortByParam)
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid sort field.",
          },
          { status: 400 }
        );
      }

      if (
        !SORT_ORDERS.has(sortOrderParam)
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid sort order.",
          },
          { status: 400 }
        );
      }

      const vendorPayables =
        await VendorSettlementService.getVendorPayables(
          {
            page,
            limit,
            search,
            sortBy:
              sortByParam as
                | "payableCreated"
                | "settled"
                | "outstanding"
                | "lastActivity",
            sortOrder:
              sortOrderParam as
                | "asc"
                | "desc",
          }
        );

      return NextResponse.json({
        success: true,
        vendorPayables,
      });
    } catch (error) {
      return handleApiError(error);
    }
  }
);