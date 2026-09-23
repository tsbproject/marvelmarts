import { NextResponse } from "next/server";

import { CourierService } from "@/app/lib/services/shipping/courier.service";

import {
  handleApiError,
  requireManageOrders,
} from "@/app/lib/auth/api";

import { badRequest } from "@/app/lib/auth/errors";
import { verifyOrigin } from "@/app/lib/auth/csrf";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApiLogging(
  async (req: Request) => {
    try {
      verifyOrigin(req);

      await requireManageOrders();

      const couriers =
        await CourierService.getActiveCouriers();

      return NextResponse.json({
        success: true,
        couriers,
      });
    } catch (error) {
      return handleApiError(error);
    }
  }
);

export const POST = withApiLogging(
  async (req: Request) => {
    try {
      verifyOrigin(req);

      const session =
        await requireManageOrders();

      const body = await req.json();

      const name = String(body.name ?? "").trim();
      const code = String(body.code ?? "").trim();

      if (!name) {
        throw badRequest("Courier name is required.");
      }

      if (!code) {
        throw badRequest("Courier code is required.");
      }

      const courier =
        await CourierService.createCourier(
          {
            name,
            code,
            description:
              body.description !== undefined
                ? String(body.description)
                : undefined,
            logoUrl:
              body.logoUrl !== undefined
                ? String(body.logoUrl)
                : undefined,
            websiteUrl:
              body.websiteUrl !== undefined
                ? String(body.websiteUrl)
                : undefined,
            sortOrder:
              body.sortOrder !== undefined
                ? Number(body.sortOrder)
                : undefined,
          },
          session.user.id
        );

      return NextResponse.json(
        {
          success: true,
          courier,
        },
        { status: 201 }
      );
    } catch (error) {
      return handleApiError(error);
    }
  }
);