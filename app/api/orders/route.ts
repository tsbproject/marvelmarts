import { NextRequest, NextResponse } from "next/server";

import {
  handleApiError,
  requireAuth,
} from "@/app/lib/auth/api";

import { verifyOrigin } from "@/app/lib/auth/csrf";
import { CheckoutService } from "@/app/lib/services/checkout.service";
import { OrderService } from "@/app/lib/services/order.service";
import { PaymentService } from "@/app/lib/services/payment.service";
import { generateUniqueOrderNumber } from "@/app/lib/orders/order-number";
import { logger } from "@/app/lib/logger";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = withApiLogging(
  async (req: NextRequest) => {
    try {
      verifyOrigin(req);

      const session =
        await requireAuth();

      const body =
        await req.json();

      const rawFormData =
        body?.formData ?? {};

      const rawItems =
        Array.isArray(body?.items)
          ? body.items
          : [];

      const platformShippingMethod =
        body?.platformShippingMethod ??
        body?.formData?.platformShippingMethod ??
        null;

      const formData =
        CheckoutService.prepareForm(
          rawFormData
        );

      const normalizedItems =
        CheckoutService.normalizeCart(
          rawItems
        );

      const checkout =
        await CheckoutService.prepareItems(
          normalizedItems,
          platformShippingMethod
        );

      const {
        isMixedCart,
        vendorGroups,
        subtotal: serverSubtotal,
        shipping: serverShipping,
        shippingMethod,
        shippingLabel,
        shippingControlledBy,
        total: serverTotal,
      } = checkout;

      const orderNumber =
        await generateUniqueOrderNumber();

      const createdOrders = [];

      for (let index = 0; index < vendorGroups.length; index++) {
        const group = vendorGroups[index];
        const isPrimary = index === 0;
        const siblingNumber =
          vendorGroups.length === 1
            ? orderNumber
            : `${orderNumber}-${String.fromCharCode(65 + index)}`;

        const order =
          await OrderService.createOrder({
            orderNumber: siblingNumber,
            userId: session.user.id,
            vendorProfileId: group.vendorProfileId,
            formData: {
              ...formData,
              orderNotes: [
                formData.orderNotes,
                isMixedCart
                  ? `Mixed cart ${orderNumber}. Platform shipping: ${shippingLabel}.`
                  : `Vendor shipping: ${shippingLabel}.`,
              ]
                .filter(Boolean)
                .join(" | "),
            },
            orderItems: group.items.map(
              ({ vendorProfileId: _vendorProfileId, productShippingMethod: _productShippingMethod, ...item }) => item
            ),
            normalizedItems,
            subtotal: group.subtotal,
            shipping: isPrimary ? serverShipping : 0,
            total: group.subtotal + (isPrimary ? serverShipping : 0),
          });

        createdOrders.push(order);
      }

      const primaryOrder = createdOrders[0];

      const payment =
        await PaymentService.initializeOrderPayment(
          primaryOrder,
          formData.email,
          serverTotal
        );

      return NextResponse.json(
        {
          ...payment,
          isMixedCart,
          shippingControlledBy,
          shippingMethod,
          shippingLabel,
          shipping: serverShipping,
          subtotal: serverSubtotal,
          total: serverTotal,
          siblingOrderIds: createdOrders.map((order) => order.id),
        },
        {
          status: 201,
        }
      );
    } catch (error) {
      logger.error(
        "DB_ORDER_ERROR",
        error
      );

      return handleApiError(error);
    }
  }
);

export const GET = withApiLogging(
  async () => {
    try {
      const session =
        await requireAuth();

      const orders =
        await OrderService.getOrders(
          session.user.id
        );

      return NextResponse.json(
        orders
      );
    } catch (error) {
      return handleApiError(error);
    }
  }
);
