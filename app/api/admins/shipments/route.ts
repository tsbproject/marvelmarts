import { NextResponse } from "next/server";

import { ShipmentService } from "@/app/lib/services/shipping/shipment.service";

import {
  handleApiError,
  requireManageOrders,
} from "@/app/lib/auth/api";

import { badRequest } from "@/app/lib/auth/errors";
import { verifyOrigin } from "@/app/lib/auth/csrf";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = withApiLogging(
  async (req: Request) => {
    try {
      verifyOrigin(req);

      await requireManageOrders();

      const body = await req.json();

      const vendorOrderId = String(
        body.vendorOrderId ?? ""
      ).trim();

      const courierId = body.courierId
        ? String(body.courierId).trim()
        : undefined;

      const trackingNumber = body.trackingNumber
        ? String(body.trackingNumber).trim()
        : undefined;

      if (!vendorOrderId) {
        throw badRequest(
          "Vendor order ID is required."
        );
      }

      const shipment =
        await ShipmentService.createShipment({
          vendorOrderId,
          courierId,
          trackingNumber,
        });

      return NextResponse.json(
        {
          success: true,
          shipment,
        },
        {
          status: 201,
        }
      );
    } catch (error) {
      return handleApiError(error);
    }
  }
);