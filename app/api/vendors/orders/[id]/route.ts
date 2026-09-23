import { NextRequest, NextResponse } from "next/server";

import {
  handleApiError,
  requireVendor,
} from "@/app/lib/auth/api";

import { VendorService } from "@/app/lib/services/vendor.service";
import { OrderService } from "@/app/lib/services/order.service";

import {
  badRequest,
} from "@/app/lib/auth/errors";

import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* -------------------------------------------------------------------------- */
/*                          UPDATE ORDER STATUS                               */
/* -------------------------------------------------------------------------- */

export const PATCH = withApiLogging(
  async (
    req: NextRequest,
    {
      params,
    }: {
      params: Promise<{ id: string }>;
    }
  ) => {
    try {
      const session =
        await requireVendor();

      const { id } =
        await params;

      const body =
        await req.json();

      const status = String(
        body.status ?? ""
      )
        .trim()
        .toUpperCase();

     
      if (!status) {
        throw badRequest(
          "Order status is required."
        );
      }

      const vendor =
        await VendorService.getVendorProfileOrThrow(
          session.user.id
        );

      const result =
        await OrderService.updateVendorOrderStatus(
          id,
          vendor.id,
          status as "APPROVED" | "REJECTED",
        );

      return NextResponse.json(
        {
          success: true,
          message:
            "Order updated successfully.",
          order: result.vendorOrder,
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

/* -------------------------------------------------------------------------- */
/*                          GET SINGLE ORDER                                  */
/* -------------------------------------------------------------------------- */

export const GET = withApiLogging(
  async (
    _req: NextRequest,
    {
      params,
    }: {
      params: Promise<{ id: string }>;
    }
  ) => {
    try {
      const session =
        await requireVendor();

      const { id } =
        await params;

      const vendor =
        await VendorService.getVendorProfileOrThrow(
          session.user.id
        );

      const order =
        await OrderService.getVendorOrderDetails(
          id,
          vendor.id
        );

      return NextResponse.json(
        {
          success: true,
          order: {
            ...order,

            total: Number(
              order.total
            ),

            subtotal: Number(
              order.subtotal
            ),

            shipping: Number(
              order.shipping
            ),

            customerName:
              `${order.firstName ?? ""} ${order.lastName ?? ""}`.trim() ||
              order.user?.name,

            customerEmail:
              order.email ??
              order.user?.email,

            useDifferentShipping:
              order.useDifferentShipping,

            shippingDetails:
              order.useDifferentShipping
                ? {
                    firstName:
                      order.shippingFirstName,
                    lastName:
                      order.shippingLastName,
                    streetAddress:
                      order.shippingAddress,
                    city:
                      order.shippingCity,
                    state:
                      order.shippingState,
                  }
                : null,

            productTitle:
              order.items[0]?.title ??
              order.items[0]?.product
                ?.title,

            productImage:
              order.items[0]
                ?.imageUrl ??
              order.items[0]
                ?.product
                ?.images?.[0]?.url,
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
