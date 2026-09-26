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

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export const PATCH = withApiLogging(
  async (
    req: Request,
    { params }: Context
  ) => {
    try {
      verifyOrigin(req);

      await requireManageOrders();

      const { id } = await params;

      const body = await req.json();

      const trackingNumber =
        body.trackingNumber !== undefined
          ? String(body.trackingNumber).trim()
          : "";

      if (!id) {
        throw badRequest(
          "Shipment ID is required."
        );
      }

      if (!trackingNumber) {
        throw badRequest(
          "Tracking number is required."
        );
      }

      const shipment =
        await ShipmentService.setShipmentTrackingNumber(
          id,
          trackingNumber
        );

      return NextResponse.json(
        {
          success: true,
          shipment,
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