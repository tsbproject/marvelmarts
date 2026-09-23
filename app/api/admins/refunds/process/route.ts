import { NextResponse } from "next/server";

import { RefundService } from "@/app/lib/services/finance/refund.service";

import {
  handleApiError,
  requireManageOrders,
} from "@/app/lib/auth/api";

import { verifyOrigin } from "@/app/lib/auth/csrf";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const PATCH =
  withApiLogging(
    async (req: Request) => {
      try {
        verifyOrigin(req);

        const session =
          await requireManageOrders();

        const body = await req.json();

        const orderId =
          typeof body.orderId === "string"
            ? body.orderId.trim()
            : "";

        if (!orderId) {
          return NextResponse.json(
            {
              success: false,
              error: "Order ID is required.",
            },
            {
              status: 400,
            }
          );
        }

        const result =
          await RefundService.processApprovedRefund(
            orderId,
            session.user.id
          );

        return NextResponse.json(
          {
            success: true,
            message: result.alreadyCompleted
              ? "Refund has already been completed."
              : "Refund processed successfully.",
            order: result.order,
            refund: {
              reference:
                result.providerRefundReference,
              status:
                result.providerStatus,
              alreadyCompleted:
                result.alreadyCompleted,
            },
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