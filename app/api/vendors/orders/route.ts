import { NextResponse } from "next/server";

import {
  handleApiError,
  requireVendor,
} from "@/app/lib/auth/api";

import { OrderService } from "@/app/lib/services/order.service";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const GET = withApiLogging(
  async () => {
    try {
      const session =
        await requireVendor();

      const vendor =
        await OrderService.getVendorOrders(
          session.user.id
        );

      const orders = vendor.orders.map(
        (order) => {
          const firstItem =
            order.items[0];

          const checkoutName =
            `${order.firstName ?? ""} ${order.lastName ?? ""}`.trim();

          const accountName =
            order.user?.name;

          const emailFallback =
            order.email?.split("@")[0] ??
            order.user?.email?.split("@")[0];

          const customerName =
            checkoutName ||
            accountName ||
            emailFallback ||
            "Guest Customer";

          return {
            id: order.id,

            orderNumber:
              order.orderNumber,

            customerName,

            customerEmail:
              order.email ??
              order.user?.email,

            customerPhone:
              order.phone,

            streetAddress:
              order.streetAddress,

            apartment:
              order.apartment,

            city:
              order.city,

            state:
              order.state,

            orderNotes:
              order.orderNotes,

            useDifferentShipping:
              order.useDifferentShipping,

            shippingRecipient:
              `${order.shippingFirstName ?? ""} ${order.shippingLastName ?? ""}`.trim(),

            shippingAddress:
              order.shippingAddress,

            shippingCity:
              order.shippingCity,

            shippingState:
              order.shippingState,

            subtotal:
              Number(order.subtotal),

            shipping:
              Number(order.shipping),

            total:
              Number(order.total),

            status:
              order.status.toUpperCase(),

            createdAt:
              order.createdAt,

            trackingNumber:
              order.trackingNumber,

            productTitle:
              firstItem?.title ??
              "MarvelMarts Order",

            productImage:
              firstItem?.imageUrl ??
              null,

            userImage:
              order.user?.image ??
              null,
          };
        }
      );

      return NextResponse.json(
        {
          success: true,
          orders,
          balance:
            Number(vendor.balance),
          lastSyncedAt:
            vendor.lastSyncedAt ??
            null,
          financialSummary:
            vendor.financialSummary,
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
