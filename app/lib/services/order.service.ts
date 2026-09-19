import { Prisma, UserRole } from "@prisma/client";
import { prisma } from "@/app/lib/prisma";
import { InventoryService } from "@/app/lib/services/inventory.service";
import { notFound,badRequest, forbidden } from "@/app/lib/auth/errors";
import { pusherServer } from "@/app/lib/pusherServer";
import { logger } from "@/app/lib/logger";


import {
  sendAdminOrderNotification,
  sendOrderConfirmationEmail,
} from "@/app/lib/mailer";

import { mapOrderToOrderConfirmationEmail } from "@/app/lib/mail/mappers/order.mapper";
import { AuditService } from "@/app/lib/services/logging/audit.service";
import { PayoutService } from "@/app/lib/services/payout.service";
import MarketplaceSalesService from "@/app/lib/services/finance/marketplace-sales.service";


type CreateOrderParams = {
  orderNumber: string;

  userId: string;

  vendorProfileId: string;

  formData: any;

  orderItems: any[];

  normalizedItems: any[];

  subtotal: number;

  shipping: number;

  shippingMethod: string;

  total: number;

  vendorOrders: Array<{
    vendorProfileId: string;
    merchandiseSubtotal: number;
    shipping: number;
    shippingMethod: string;
    total: number;
    itemKeys: string[];
  }>;
};

export class OrderService {
static async createOrderTx(
    tx: Prisma.TransactionClient,
    {
      orderNumber,
      userId,
      vendorProfileId,
      formData,
      orderItems,
      normalizedItems,
      subtotal,
      shipping,
      shippingMethod,
      total,
      vendorOrders,
    }: CreateOrderParams
  ) {
    /*
     * The existing Order.vendorProfileId field is still
     * required by the legacy schema. For multi-vendor orders
     * we retain the first vendor as a compatibility value.
     *
     * All real vendor ownership/allocation is represented by
     * VendorOrder records below.
     */
    const createdOrder =
      await tx.order.create({
        data: {
          orderNumber,

          userId,

          vendorProfileId,

          email:
            formData.email,

          firstName:
            formData.firstName,

          lastName:
            formData.lastName,

          phone:
            formData.phone || null,

          streetAddress:
            formData.streetAddress,

          apartment:
            formData.apartment || null,

          city:
            formData.city,

          state:
            formData.state,

          orderNotes:
            formData.orderNotes || null,

          useDifferentShipping:
            formData.useDifferentShipping,

          shippingFirstName:
            formData.useDifferentShipping
              ? formData
                  .shippingDetails
                  .firstName || null
              : formData.firstName,

          shippingLastName:
            formData.useDifferentShipping
              ? formData
                  .shippingDetails
                  .lastName || null
              : formData.lastName,

          shippingAddress:
            formData.useDifferentShipping
              ? formData
                  .shippingDetails
                  .streetAddress || null
              : formData.streetAddress,

          shippingCity:
            formData.useDifferentShipping
              ? formData
                  .shippingDetails
                  .city || null
              : formData.city,

          shippingState:
            formData.useDifferentShipping
              ? formData
                  .shippingDetails
                  .state || null
              : formData.state,

          subtotal,

          shipping,

          shippingMethod,

          total,

          status:
            "pending",

          paymentStatus:
            false,

          items: {
            create:
              orderItems,
          },
        },

        include: {
          items: true,
        },
      });

    /*
     * Build a deterministic lookup for the OrderItems
     * created above.
     */
    const orderItemsByKey =
      new Map<
        string,
        (typeof createdOrder.items)[number]
      >();

    for (
      const item of
        createdOrder.items
    ) {
      const key =
        `${item.productId}:${
          item.variantId ??
          "default"
        }`;

      orderItemsByKey.set(
        key,
        item
      );
    }

    /*
     * Resolve the current commission rate for every
     * vendor once inside the same transaction.
     *
     * VendorScore is the authoritative persisted source
     * for the vendor's current commission rate.
     *
     * The rate is snapshotted onto VendorOrder so
     * historical orders retain the commission that
     * applied when the order was created.
     */
    const vendorProfileIds = [
      ...new Set(
        vendorOrders.map(
          (vendorOrder) =>
            vendorOrder.vendorProfileId
        )
      ),
    ];

    const vendorScores =
      await tx.vendorScore.findMany({
        where: {
          vendorProfileId: {
            in: vendorProfileIds,
          },
        },
        select: {
          vendorProfileId: true,
          commissionRate: true,
        },
      });

    const commissionRateByVendor =
      new Map(
        vendorScores.map(
          (score) => [
            score.vendorProfileId,
            score.commissionRate,
          ]
        )
      );

    /*
     * Create vendor-level child orders and
     * their item mappings inside the same transaction.
     */
    for (
      const vendorOrderData of
        vendorOrders
    ) {
      const commissionRate =
        commissionRateByVendor.get(
          vendorOrderData.vendorProfileId
        );

      if (commissionRate == null) {
        throw badRequest(
          "Vendor commission configuration not found."
        );
      }

      const commissionAmount =
        vendorOrderData.merchandiseSubtotal *
        commissionRate;

      const vendorNet =
        vendorOrderData.merchandiseSubtotal -
        commissionAmount;
      const vendorOrder =
        await tx.vendorOrder.create({
          data: {
            orderId:
              createdOrder.id,

            vendorProfileId:
              vendorOrderData
                .vendorProfileId,

            merchandiseSubtotal:
              vendorOrderData
                .merchandiseSubtotal,

            shipping:
              vendorOrderData
                .shipping,

            shippingMethod:
              vendorOrderData
                .shippingMethod,

            total:
              vendorOrderData
                .total,

            commissionRate,

            commissionAmount,

            vendorNet,

            status:
              "PENDING",
          },
        });

      const mappings =
        vendorOrderData
          .itemKeys
          .map(
            (itemKey) => {
              const orderItem =
                orderItemsByKey.get(
                  itemKey
                );

              if (!orderItem) {
                throw badRequest(
                  "Unable to map an order item to its vendor order."
                );
              }

              return {
                vendorOrderId:
                  vendorOrder.id,

                orderItemId:
                  orderItem.id,
              };
            }
          );

      if (mappings.length) {
        await tx.vendorOrderItem.createMany({
          data:
            mappings,
        });
      }
    }

    return {
      ...createdOrder,

      vendorOrders:
        await tx.vendorOrder.findMany({
          where: {
            orderId:
              createdOrder.id,
          },

          orderBy: {
            createdAt:
              "asc",
          },

          include: {
            items: true,
          },
        }),
    };
  }

      static async createOrder(
        params: CreateOrderParams
      ) {
        return prisma.$transaction(
          async (
            tx: Prisma.TransactionClient
          ) => {
            return this.createOrderTx(
              tx,
              params
            );
    }
  );
}
    
static async getOrders(userId: string) {
    return prisma.order.findMany({
      where: {
        userId,
      },

      include: {
        items: true,

        vendorProfile: {
          select: {
            storeName: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  }

  static async getVendorOrders(
      userId: string
    ) {
      const vendor =
        await prisma.vendorProfile.findUnique({
          where: {
            userId,
          },
          include: {
            marketplaceTransactions: {
              where: { status: "SUCCESS" },
              select: {
                orderId: true,
                grossAmount: true,
                netAmount: true,
              },
            },
            vendorOrders: {
              orderBy: {
                createdAt: "desc",
              },
              include: {
                order: {
                  include: {
                    user: {
                      select: { name: true, image: true, email: true },
                    },
                  },
                },
                items: {
                  include: {
                    orderItem: true,
                  },
                },
              },
            },
          },
        });

      if (!vendor) {
        throw notFound(
          "Vendor profile not found."
        );
      }

      const finalizedOrderIds = new Set(
        vendor.marketplaceTransactions.map((transaction) => transaction.orderId)
      );

      const financialSummary = {
        netEarned: vendor.marketplaceTransactions.reduce(
          (sum, transaction) => sum + transaction.netAmount,
          0
        ),
        finalizedGross: vendor.marketplaceTransactions.reduce(
          (sum, transaction) => sum + transaction.grossAmount,
          0
        ),
        pendingNet: vendor.vendorOrders
          .filter((vendorOrder) => !finalizedOrderIds.has(vendorOrder.orderId))
          .reduce((sum, vendorOrder) => sum + Number(vendorOrder.vendorNet ?? 0), 0),
      };

      return {
        ...vendor,
        financialSummary,
        // VendorOrder, not Order.vendorProfileId, is the ownership boundary.
        orders: vendor.vendorOrders.map((vendorOrder) => ({
          ...vendorOrder.order,
          subtotal: vendorOrder.merchandiseSubtotal,
          shipping: vendorOrder.shipping,
          total: vendorOrder.total,
          status: vendorOrder.status,
          items: vendorOrder.items.map((item) => item.orderItem),
        })),
      };
    }

    static async getOrderByIdOrThrow(
      orderId: string
    ) {
      const order =
        await prisma.order.findUnique({
          where: {
            id: orderId,
          },
        });

      if (!order) {
        throw notFound(
          "Order not found."
        );
      }

      if (order.paymentStatus) {
        return order;
      }

      return order;
    }

    static async updateVendorOrderStatus(
    orderId: string,
    vendorProfileId: string,
    status: "APPROVED" | "REJECTED",
    trackingNumber?: string | null
  ) {
    if (!orderId || !vendorProfileId || !status) {
      throw badRequest("Order ID, vendor profile ID and status are required.");
    }

    const normalizedStatus = status.toUpperCase() as
      | "APPROVED"
      | "REJECTED";

    const result = await prisma.$transaction(async (tx) => {
      const vendorOrder = await tx.vendorOrder.findUnique({
        where: {
          orderId_vendorProfileId: {
            orderId,
            vendorProfileId,
          },
        },
        select: {
          id: true,
          orderId: true,
          vendorProfileId: true,
          status: true,
        },
      });

      if (!vendorOrder) {
        throw notFound("Vendor order not found.");
      }

      const updatedVendorOrder = await tx.vendorOrder.update({
        where: { id: vendorOrder.id },
        data: {
          status: normalizedStatus,
        },
      });

      if (
        trackingNumber !== undefined &&
        normalizedStatus === "APPROVED"
      ) {
        await tx.order.update({
          where: { id: orderId },
          data: {
            trackingNumber: trackingNumber?.trim() || null,
          },
        });
      }

      return {
        vendorOrder: updatedVendorOrder,
        previousStatus: vendorOrder.status,
      };
    });

    return result;
  }
  static async updateOrderStatus(
  orderId: string,
  status: string,
  trackingNumber: string | null
) {
  const order =
    await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      select: {
        id: true,
        userId: true,
        status: true,
        trackingNumber: true,
      },
    });

  if (!order) {
    throw notFound(
      "Order not found."
    );
  }

  const updatedOrder =
    await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status,
        trackingNumber,
      },
    });

  await AuditService.orderStatusChanged({
    actorId: order.userId ?? undefined,
    entityId: updatedOrder.id,
    oldValues: {
      status: order.status,
      trackingNumber:
        order.trackingNumber,
    },
    newValues: {
      status:
        updatedOrder.status,
      trackingNumber:
        updatedOrder.trackingNumber,
    },
  });

  return updatedOrder;
}

    static async getVendorOrderDetails(
      orderId: string,
      vendorProfileId: string
    ) {
      const vendorOrder =
        await prisma.vendorOrder.findUnique({
          where: {
            orderId_vendorProfileId: { orderId, vendorProfileId },
          },
          include: {
            order: { include: { user: { select: { name: true, email: true, image: true } } } },
            items: {
              include: {
                orderItem: {
                  include: {
                    product: {
                      select: {
                        title: true,
                        images: { take: 1, select: { url: true } },
                      },
                    },
                  },
                },
              },
            },
          },
        });

      if (!vendorOrder) {
        throw notFound(
          "Vendor order not found."
        );
      }

      return {
        ...vendorOrder.order,
        subtotal: vendorOrder.merchandiseSubtotal,
        shipping: vendorOrder.shipping,
        total: vendorOrder.total,
        status: vendorOrder.status,
        items: vendorOrder.items.map((item) => item.orderItem),
      };
    }


    static async getAdminOrders() {
      const orders =
        await prisma.order.findMany({
          orderBy: {
            createdAt: "desc",
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },

            _count: {
              select: {
                items: true,
              },
            },
          },
        });

      return orders;
    }

   
    static async finalizeOrder(
      orderId: string,
      status: string
    ) {
      if (!orderId || !status) {
        throw badRequest(
          "Order ID and status are required."
        );
      }

      const order =
        await prisma.order.findUnique({
          where: {
            id: orderId,
          },
          select: {
            id: true,
          },
        });

      if (!order) {
        throw notFound(
          "Order not found."
        );
      }

      const updatedOrder =
        await prisma.order.update({
          where: {
            id: orderId,
          },
          data: {
            status:
              status.toUpperCase(),
          },
        });

      return updatedOrder;
    }


    static async updateAdminOrderStatus(
      orderId: string,
      nextStatus: string
    ) {
      if (!orderId || !nextStatus) {
        throw badRequest(
          "Order ID and status are required."
        );
      }

      const existingOrder =
        await prisma.order.findUnique({
          where: {
            id: orderId,
          },
          select: {
            id: true,
            status: true,
            total: true,
            vendorProfileId: true,
            userId: true,
            email: true,
            firstName: true,
            orderNumber: true,
          },
        });

      if (!existingOrder) {
        throw notFound(
          "Order not found."
        );
      }

      const previousStatus =
        String(
          existingOrder.status
        ).toUpperCase();

      const updatedOrder =
        await prisma.$transaction(
          async (tx) => {
            const order =
              await tx.order.update({
                where: {
                  id: orderId,
                },
                data: {
                  status: nextStatus,
                },
                include: {
                  items: true,
                  vendorProfile: {
                    select: {
                      storeName: true,
                    },
                  },
                },
              });

            return order;
          }
        );

      await AuditService.orderStatusChanged({
        actorId:
          existingOrder.userId ?? undefined,
        entityId: updatedOrder.id,
        oldValues: {
          status: previousStatus,
        },
        newValues: {
          status: updatedOrder.status,
        },
      });

      /*
       * Delivery is confirmed only by an administrator. Credit every vendor
       * allocation at that point. finalizeVendorPayout is idempotent, so an
       * admin retry safely repairs a previous failed credit without paying
       * a vendor twice.
       */
      if (nextStatus === "DELIVERED") {
        await PayoutService.finalizeVendorPayout(orderId);
      }

      return {
        previousStatus,
        updatedOrder,
        userId:
          existingOrder.userId,
      };
    }


    static async updateAdminOrderState(
      orderId: string,
      status: string,
      refundReason: string,
      isSuperAdmin: boolean
    ) {
      if (!status) {
        throw badRequest(
          "Order status is required."
        );
      }

      const order =
        await prisma.order.findUnique({
          where: {
            id: orderId,
          },
          select: {
            id: true,
            total: true,
            status: true,
            vendorProfileId: true,
          },
        });

      if (!order) {
        throw notFound(
          "Order not found."
        );
      }

      const updateData: {
        status: string;
        refundStatus?: string;
        refundReason?: string;
      } = {
        status,
      };

      if (status === "REFUNDED") {
        if (!isSuperAdmin) {
          throw forbidden(
            "Level 2 clearance required for refunds."
          );
        }

        updateData.refundStatus =
          "completed";

        updateData.refundReason =
          refundReason;
      }

      const updatedOrder =
        await prisma.$transaction(
          async (tx) => {
            const result =
              await tx.order.update({
                where: {
                  id: orderId,
                },
                data: updateData,
              });

            const movingToDelivered =
              status ===
                "DELIVERED" &&
              order.status !==
                "DELIVERED";

            return result;
          }
        );


        await AuditService.orderStatusChanged({
            actorId: undefined, // replace with adminId when this method receives it
            entityId: updatedOrder.id,
            oldValues: {
              status: order.status,
            },
            newValues: {
              status: updatedOrder.status,
              refundStatus:
                updatedOrder.refundStatus,
              refundReason:
                updatedOrder.refundReason,
            },
          });

      return updatedOrder;
    }


    static async processRefundRequest(
      orderId: string,
      action: "approved" | "rejected",
      adminNote: string
    ) {
      if (
        action !== "approved" &&
        action !== "rejected"
      ) {
        throw badRequest(
          "Invalid refund action."
        );
      }

      const order =
        await prisma.order.findUnique({
          where: {
            id: orderId,
          },
          include: {
            items: true,
          },
        });

      if (!order) {
        throw notFound(
          "Order not found."
        );
      }

      const updatedOrder =
        await prisma.order.update({
          where: {
            id: orderId,
          },
          data: {
            refundStatus: action,
            cancelReason: adminNote,

            ...(action === "approved"
              ? {
                  status: "refunded",
                }
              : {}),
          },
          include: {
            items: true,
          },
        });

      await AuditService.orderRefunded({
        actorId: undefined, // replace with adminId when available
        entityId: updatedOrder.id,
        oldValues: {
          refundStatus: order.refundStatus,
          status: order.status,
        },
        newValues: {
          refundStatus:
            updatedOrder.refundStatus,
          status:
            updatedOrder.status,
          reason: adminNote,
        },
      });

      return updatedOrder;
    };


    static async processOrderRefund(
  orderId: string,
  action: "approved" | "rejected",
  adminNote: string,
  actorId: string,
  actorRole: UserRole
) {
  if (!orderId) {
    throw badRequest(
      "Order ID is required."
    );
  }

  if (
    action !== "approved" &&
    action !== "rejected"
  ) {
    throw badRequest(
      "Invalid refund action."
    );
  }

  const currentOrder =
    await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        items: true,
      },
    });

  if (!currentOrder) {
    throw notFound(
      "Order not found."
    );
  }

  const updatedOrder =
    await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status:
          action === "approved"
            ? "refunded"
            : currentOrder.status,

        refundStatus: action,

        cancelReason:
          adminNote ||
          (action === "approved"
            ? "Authorized by Administrator"
            : "Declined by Administrator"),
      },
      include: {
        items: true,
      },
    });

  const auditOldValues = {
    refundStatus:
      currentOrder.refundStatus,
    status:
      currentOrder.status,
  };

  const auditNewValues = {
    refundStatus:
      updatedOrder.refundStatus,
    status:
      updatedOrder.status,
    reason:
      adminNote ||
      (action === "approved"
        ? "Authorized by Administrator"
        : "Declined by Administrator"),
  };

  if (action === "approved") {
    await AuditService.refundApproved({
      actorId,
      actorRole,
      entityId: updatedOrder.id,
      oldValues: auditOldValues,
      newValues: auditNewValues,
    });

    await AuditService.orderRefunded({
      actorId,
      actorRole,
      entityId: updatedOrder.id,
      oldValues: auditOldValues,
      newValues: auditNewValues,
    });
  } else {
    await AuditService.refundRejected({
      actorId,
      actorRole,
      entityId: updatedOrder.id,
      oldValues: auditOldValues,
      newValues: auditNewValues,
    });
  }

  return updatedOrder;
}


static async completePaidOrder(
  orderId: string,
  paymentReference?: string,
  processingFee?: number
) {
  let paymentClaimed = false;

  const order = await prisma.$transaction(
    async (tx) => {
      const order =
        await tx.order.findUnique({
          where: {
            id: orderId,
          },
          include: {
            items: true,
            vendorProfile: {
              select: {
                id: true,
                userId: true,
                storeName: true,
              },
            },
          },
        });

      if (!order) {
        throw notFound(
          "Order not found."
        );
      }

      /*
       * Atomically claim payment completion.
       *
       * Only the request that changes paymentStatus
       * from false -> true is allowed to continue with
       * vendor credit, cart cleanup, and inventory
       * deduction.
       *
       * This prevents concurrent payment callbacks from
       * processing the same order more than once.
       */
      const paymentUpdate =
        await tx.order.updateMany({
          where: {
            id: orderId,
            paymentStatus: false,
          },
          data: {
            paymentStatus: true,
            status: "processing",
            ...(paymentReference
              ? {
                  paymentIntentId:
                    paymentReference,
                }
              : {}),
          },
        });

      /*
       * Another request has already completed
       * payment for this order.
       *
       * Return the current order without repeating
       * financial or inventory mutations.
       */
      if (paymentUpdate.count === 0) {
        const alreadyPaid =
          await tx.order.findUnique({
            where: {
              id: orderId,
            },
            include: {
              items: true,
              vendorProfile: {
                select: {
                  id: true,
                  userId: true,
                  storeName: true,
                },
              },
            },
          });

        if (!alreadyPaid) {
          throw notFound(
            "Order not found."
          );
        }

        return alreadyPaid;
      }

      /*
       * Payment was successfully claimed by this
       * transaction. Perform all dependent financial
       * and inventory mutations atomically.
       */
      paymentClaimed = true;

      /*
       * Payment confirmation only marks the customer order as paid.
       *
       * Vendor balances are credited later, when delivery is finalized,
       * from VendorOrder.vendorNet. This prevents both shipping and the
       * MarvelMarts commission from reaching vendor balances.
       */
      const vendorOrders =
        await tx.vendorOrder.findMany({
          where: {
            orderId: order.id,
          },
          select: {
            id: true,
          },
        });

      if (vendorOrders.length === 0) {
        throw badRequest(
          "Paid order has no vendor allocations."
        );
      }

      if (order.userId) {
        await tx.cartItem.deleteMany({
          where: {
            cart: {
              userId: order.userId,
            },
          },
        });
      }

      const inventoryItems =
        order.items
          .filter(
            (
              item
            ): item is typeof item & {
              productId: string;
            } =>
              item.productId !== null
          )
          .map((item) => ({
            productId:
              item.productId,
            variantId:
              item.variantId,
            quantity: item.qty,
          }));

      await InventoryService.decrementStock(
        tx,
        inventoryItems
      );

      /*
       * Return the order with the newly persisted
       * payment state instead of the stale object
       * loaded before the update.
       */
      return {
        ...order,
        paymentStatus: true,
        status: "processing",
        ...(paymentReference
          ? {
              paymentIntentId:
                paymentReference,
            }
          : {}),
      };
    }
  );

  /*
   * If another request already completed payment,
   * do not repeat accounting, audit, or notifications.
   */
  if (!paymentClaimed) {
    return order;
  }

  /*
   * ---------------------------------------------------------------
   * MARKETPLACE SALES ACCOUNTING
   * ---------------------------------------------------------------
   *
   * The payment claim transaction above has now committed.
   *
   * MarketplaceSalesService uses its own atomic financial
   * transaction to post:
   *
   * 1. Dr Paystack Clearing
   *    Cr Order Clearing
   *
   * 2. Dr Order Clearing
   *    Cr Vendor Payable
   *    Cr Marketplace Commission Revenue
   *    Cr Shipping Revenue
   *
   * This is intentionally outside the payment-claim transaction
   * because MarketplaceSalesService manages its own Prisma
   * transaction.
   */
  await MarketplaceSalesService.recordSuccessfulOrderSale(
    orderId,
    processingFee
  );

  /*
   * Only the request that successfully claimed the
   * payment transition reaches this audit point.
   *
   * Payment completion is performed by the system /
   * payment provider flow, not by the customer.
   */
  await AuditService.orderStatusChanged({
    actorId: undefined,
    entityId: order.id,
    oldValues: {
      paymentStatus: false,
      status: "pending",
    },
    newValues: {
      paymentStatus: true,
      status: "processing",
      paymentReference,
      actorType: "SYSTEM",
      paymentSource: "PAYSTACK",
    },
  });

  /*
   * Notifications are intentionally outside the
   * payment transaction. A mail failure must not
   * roll back a successful payment.
   */
  try {
    if (!order.emailSent) {
      await Promise.all([
        sendOrderConfirmationEmail(
          mapOrderToOrderConfirmationEmail(
            order
          )
        ),
        sendAdminOrderNotification(
          order
        ),
      ]);

      await prisma.order.update({
        where: {
          id: order.id,
        },
        data: {
          emailSent: true,
        },
      });
    }
  } catch (mailError: any) {
    logger.error(
      "ORDER_EMAIL_ERROR:",
      mailError?.message ?? mailError
    );
  }

  return order;
}


static async validateVerifiedPayment(
  orderId: string,
  transaction: any
) {
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
    include: {
      items: true,
      vendorProfile: {
        select: {
          storeName: true,
        },
      },
    },
  });

  if (!order) {
    throw notFound("Order not found.");
  }

  const metadata =
    transaction.metadata ?? {};

  if (
    metadata.orderId &&
    metadata.orderId !== order.id
  ) {
    throw badRequest(
      "Payment reference does not belong to this order."
    );
  }

  if (
    metadata.orderNumber &&
    metadata.orderNumber !== order.orderNumber
  ) {
    throw badRequest(
      "Order number mismatch."
    );
  }

  const expectedAmount =
    Math.round(Number(order.total) * 100);

  if (
    Number(transaction.amount) !==
    expectedAmount
  ) {
    throw badRequest(
      "Payment amount mismatch."
    );
  }

  if (
    order.email &&
    transaction.customer?.email &&
    order.email.toLowerCase() !==
      transaction.customer.email.toLowerCase()
  ) {
    throw badRequest(
      "Customer email mismatch."
    );
  }

  return prisma.order.findUnique({
    where: {
      id: order.id,
    },
    select: {
      id: true,
      orderNumber: true,
      paymentStatus: true,
      paymentIntentId: true,
      status: true,
    },
  });
}


static async getOrderPaymentStatus(
  orderNumber: string
) {
  const order = await prisma.order.findUnique({
    where: {
      orderNumber,
    },
    select: {
      id: true,
      orderNumber: true,
      paymentStatus: true,
      paymentIntentId: true,
      status: true,
      createdAt: true,
    },
  });

  if (!order) {
    throw notFound("Order not found.");
  }

  return order;
}


static async getOrderByNumber(
  orderNumber: string
) {
  const order =
    await prisma.order.findUnique({
      where: {
        orderNumber,
      },
      include: {
        items: true,
        vendorProfile: {
          select: {
            id: true,
            storeName: true,
          },
        },
      },
    });

  if (!order) {
    throw notFound("Order not found.");
  }

  return order;
}


static async getOrderStatusById(
  orderId: string
) {
  const order =
    await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      select: {
        id: true,
        orderNumber: true,
        paymentStatus: true,
        status: true,
        createdAt: true,
        paymentIntentId: true,
      },
    });

  if (!order) {
    throw notFound("Order not found.");
  }

  return order;
}

static async getUserOrderByNumber(
  userId: string,
  orderReference: string,
  userEmail?: string | null
) {
  const reference = orderReference.trim();

  if (!reference) {
    throw badRequest("Order number is required.");
  }

  const order =
    await prisma.order.findFirst({
      where: {
        AND: [
          {
            OR: [
              { userId },
              ...(userEmail
                ? [{
                    email: {
                      equals: userEmail.trim(),
                      mode: "insensitive" as const,
                    },
                  }]
                : []),
            ],
          },
          {
            OR: [
              {
                orderNumber: {
                  equals: reference,
                  mode: "insensitive",
                },
              },
              // Supports customers who paste the internal order ID from an older receipt.
              { id: reference },
            ],
          },
        ],
      },
      include: {
        items: true,
        vendorOrders: {
          select: {
            status: true,
            vendorProfile: {
              select: { storeName: true },
            },
          },
        },
      },
    });

  if (!order) {
    throw notFound("Order not found.");
  }

  return order;
}


static async requestRefund(
  userId: string,
  orderNumber: string,
  reason: string,
  customerName: string
) {
  const order = await prisma.order.findFirst({
    where: {
      orderNumber,
      userId,
    },
  });

  if (!order) {
    throw notFound("Order not found.");
  }

  if (!order.paymentStatus) {
    throw forbidden(
      "Only paid orders can be refunded."
    );
  }

  if (order.refundStatus === "requested") {
    throw badRequest(
      "Refund has already been requested."
    );
  }

  if (order.refundStatus === "approved") {
    throw badRequest(
      "Refund has already been approved."
    );
  }

  const updatedOrder =
    await prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        refundStatus: "requested",
        refundReason: reason.trim(),
      },
      include: {
        items: true,
        vendorProfile: {
          select: {
            id: true,
            storeName: true,
          },
        },
      },
    });

      await AuditService.refundRequested({
        actorId: userId,
        actorRole: UserRole.CUSTOMER,
        entityId: updatedOrder.id,
        oldValues: {
          refundStatus: order.refundStatus,
          refundReason: order.refundReason,
        },
        newValues: {
          refundStatus: updatedOrder.refundStatus,
          refundReason: updatedOrder.refundReason,
          reason: reason.trim(),
        },
      });

  try {
    await pusherServer.trigger(
      "admin-orders",
      "new-refund-request",
      {
        id: updatedOrder.id,
        orderId: updatedOrder.id,
        orderNumber:
          updatedOrder.orderNumber,
        refundStatus:
          updatedOrder.refundStatus,
        refundReason:
          updatedOrder.refundReason,
        customerName,
        amount: Number(updatedOrder.total),
        status: updatedOrder.status,
      }
    );
  } catch (error) {
    logger.error(
      "PUSHER_REFUND_ERROR:",
      error
    );
  }

  return updatedOrder;
}


static async cancelOrder(
  userId: string,
  orderNumber: string,
  reason: string,
  customerName: string
) {
  const order = await prisma.order.findFirst({
    where: {
      orderNumber,
      userId,
    },
    include: {
      items: true,
    },
  });

  if (!order) {
    throw notFound("Order not found.");
  }

  const status = order.status.toLowerCase();

  if (status === "cancelled") {
    throw badRequest("Order has already been cancelled.");
  }

  if (status === "delivered") {
    throw forbidden("Delivered orders cannot be cancelled.");
  }

  if (status === "shipped") {
    throw forbidden("Shipped orders cannot be cancelled.");
  }

  const updatedOrder = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: {
        id: order.id,
      },
      data: {
        status: "cancelled",
        cancelReason: reason,
      },
      include: {
        items: true,
        vendorProfile: {
          select: {
            id: true,
            storeName: true,
          },
        },
      },
    });

    // Restore stock
    for (const item of order.items) {
      if (item.variantId) {
        await tx.variant.update({
          where: {
            id: item.variantId,
          },
          data: {
            stock: {
              increment: item.qty,
            },
          },
        });
      }

      if (item.productId) {
        await tx.product.update({
          where: {
            id: item.productId,
          },
          data: {
            stock: {
              increment: item.qty,
            },
            salesCount: {
              decrement: item.qty,
            },
          },
        });
      }
    }

    return updated;
  });

    await AuditService.orderCancelled({
      actorId: userId,
      actorRole: UserRole.CUSTOMER,
      entityId: updatedOrder.id,
    oldValues: {
      status: order.status,
    },
    newValues: {
      status: updatedOrder.status,
      cancelReason: reason,
    },
  });

  try {
    const customerPayload = {
      ...updatedOrder,
      subtotal: Number(updatedOrder.subtotal),
      shipping: Number(updatedOrder.shipping),
      tax: Number(updatedOrder.tax),
      total: Number(updatedOrder.total),
      items: updatedOrder.items.map((item) => ({
        ...item,
        unitPrice: Number(item.unitPrice),
      })),
    };

    await Promise.all([
      // Admin notification
      pusherServer.trigger(
        "admin-notifications",
        "new-notification",
        {
          id: updatedOrder.id,
          type: "ORDER_CANCELLED",
          title: "Order Cancelled",
          message: `Order #${updatedOrder.orderNumber} was cancelled by ${customerName}.`,
          orderId: updatedOrder.id,
          orderNumber: updatedOrder.orderNumber,
          createdAt: new Date().toISOString(),
        }
      ),

      // Admin Orders page
      pusherServer.trigger(
        "admin-orders",
        "order-cancelled",
        {
          orderId: updatedOrder.id,
          orderNumber: updatedOrder.orderNumber,
          customerName,
          total: Number(updatedOrder.total),
          reason,
          status: updatedOrder.status,
        }
      ),

      // Customer Orders page
      pusherServer.trigger(
        `user-${userId}-customer`,
        "order-update",
        customerPayload
      ),
    ]);
  } catch (error) {
    logger.error(
      "ORDER_CANCEL_PUSHER_ERROR:",
      error
    );
  }

  return updatedOrder;
}

static async validateWebhookOrder(
  orderId: string,
  orderNumber: string | undefined,
  amount: number,
  customerEmail: string
) {
  const order =
    await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        items: true,
        vendorProfile: {
          select: {
            id: true,
            userId: true,
            storeName: true,
          },
        },
      },
    });

  if (!order) {
    throw notFound(
      "Order not found."
    );
  }

  if (
    orderNumber &&
    order.orderNumber !==
      orderNumber
  ) {
    throw badRequest(
      "Order number mismatch"
    );
  }

  const expectedAmount =
    Math.round(
      Number(order.total) * 100
    );

  if (
    expectedAmount !== amount
  ) {
    throw badRequest(
      "Payment amount mismatch"
    );
  }

  if (
    order.email &&
    customerEmail &&
    order.email.toLowerCase() !==
      customerEmail
  ) {
    throw badRequest(
      "Customer email mismatch"
    );
  }

  return order;
}



static async completeOrderPayment(
  transaction: any
) {
  const metadata =
    transaction.metadata ?? {};

  if (!metadata.orderId) {
    throw badRequest(
      "Order ID missing from payment metadata."
    );
  }

  await this.validateVerifiedPayment(
    metadata.orderId,
    transaction
  );

  const processingFee =
    transaction.raw?.fees != null
      ? Number(transaction.raw.fees) / 100
      : undefined;

  const order =
    await this.completePaidOrder(
      metadata.orderId,
      transaction.reference,
      processingFee
    );

    await AuditService.orderCreated({
      actorId: order.userId ?? undefined,
      entityId: order.id,
      newValues: {
        orderNumber: order.orderNumber,
        paymentStatus: true,
        paymentReference:
          transaction.reference,
        returnUrl:
          typeof metadata.returnUrl === "string"
            ? metadata.returnUrl
            : null,
      },
    });

  return {
    success: true,
    order,
    returnUrl:
      typeof metadata.returnUrl === "string"
        ? metadata.returnUrl
        : `/thank-you?orderNumber=${order.orderNumber}`,
  };
}


static async getRecentActivity(limit = 5) {
  return prisma.order.findMany({
    take: limit,
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      orderNumber: true,
      total: true,
      firstName: true,
      lastName: true,
      paymentStatus: true,
      createdAt: true,
    },
  });
}



static async getAdminActivityFeed({
  page = 1,
  search = "",
  status = "all",
  pageSize = 10,
}: {
  page?: number;
  search?: string;
  status?: string;
  pageSize?: number;
}) {
  const safePage =
    Math.max(1, page);

  const safePageSize =
    Math.max(1, pageSize);

  const query =
    search.trim();

  const skip =
    (safePage - 1) *
    safePageSize;

  const where: Prisma.OrderWhereInput = {
    AND: [
      query
        ? {
            OR: [
              {
                orderNumber: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                firstName: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                lastName: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {},

      status === "paid"
        ? {
            paymentStatus: true,
          }
        : status === "pending"
          ? {
              paymentStatus: false,
            }
          : {},
    ],
  };

  const [
    rawActivities,
    totalCount,
  ] = await Promise.all([
    prisma.order.findMany({
      where,

      take: safePageSize,
      skip,

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        orderNumber: true,
        total: true,
        firstName: true,
        lastName: true,
        paymentStatus: true,
        createdAt: true,
        status: true,
      },
    }),

    prisma.order.count({
      where,
    }),
  ]);

  const activities =
    rawActivities.map(
      (order) => ({
        ...order,
        total: Number(
          order.total
        ),
      })
    );

  return {
    activities,
    totalCount,
    totalPages: Math.ceil(
      totalCount /
        safePageSize
    ),
    page: safePage,
    pageSize: safePageSize,
  };
}

static async getAdminOrderById(
  orderId: string
) {
  const order =
    await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
        items: true,
      },
    });

  if (!order) {
    throw notFound(
      "Order not found."
    );
  }

  return order;
}

/* -------------------------------------------------------------------------- */
/*                      ADMIN REFUND OPERATIONS                               */
/* -------------------------------------------------------------------------- */

static async getPendingRefundQueue() {
  const rawPendingRefunds =
    await prisma.order.findMany({
      where: {
        refundStatus: {
          in: ["requested", "pending"],
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  const totalPendingVolume =
    rawPendingRefunds.reduce(
      (acc, order) =>
        acc + Number(order.total),
      0
    );

  const pendingRefunds =
    rawPendingRefunds.map(
      (order) => ({
        ...order,

        subtotal: Number(
          order.subtotal
        ),

        shipping: Number(
          order.shipping
        ),

        tax: Number(
          order.tax
        ),

        total: Number(
          order.total
        ),

        createdAt:
          order.createdAt.toISOString(),

        items: order.items.map(
          (item) => ({
            ...item,

            unitPrice: Number(
              item.unitPrice
            ),
          })
        ),
      })
    );

  return {
    pendingRefunds,
    totalPendingVolume,
  };
}


/* -------------------------------------------------------------------------- */
/*                      ADMIN DASHBOARD STATISTICS                            */
/* -------------------------------------------------------------------------- */
   static async getTodayRevenue() {
  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const stats = await prisma.order.aggregate({
    where: {
      createdAt: {
        gte: today,
      },
      paymentStatus: true,
    },
    _sum: {
      total: true,
    },
  });

  return Number(stats._sum.total ?? 0);
}



/* -------------------------------------------------------------------------- */
/*                      ADMIN PROCESS REFUND DECISION                          */
/* -------------------------------------------------------------------------- */
    static async processRefundDecision(
    orderId: string,
    action: "approved" | "rejected",
    reason: string,
    actorId: string,
    actorRole: UserRole
  ) {
    const currentOrder =
      await prisma.order.findUnique({
        where: {
          id: orderId,
        },
      });

    if (!currentOrder) {
      throw notFound("Order not found.");
    }

    const updatedOrder =
      await prisma.order.update({
        where: {
          id: orderId,
        },
        data: {
          status:
            action === "approved"
              ? "refunded"
              : currentOrder.status,

          refundStatus: action,

          refundReason:
            reason || "Administrative decision",

          cancelReason:
            reason || "Administrative decision",
        },
        include: {
          items: true,
        },
      });

    if (action === "approved") {
      await AuditService.refundApproved({
        actorId,
        actorRole,
        entityId: updatedOrder.id,
        oldValues: {
          status: currentOrder.status,
          refundStatus:
            currentOrder.refundStatus,
          refundReason:
            currentOrder.refundReason,
        },
        newValues: {
          status: updatedOrder.status,
          refundStatus:
            updatedOrder.refundStatus,
          refundReason:
            updatedOrder.refundReason,
          reason:
            reason || "Administrative decision",
        },
      });

      await AuditService.orderRefunded({
        actorId,
        actorRole,
        entityId: updatedOrder.id,
        oldValues: {
          status: currentOrder.status,
          refundStatus:
            currentOrder.refundStatus,
          refundReason:
            currentOrder.refundReason,
        },
        newValues: {
          status: updatedOrder.status,
          refundStatus:
            updatedOrder.refundStatus,
          refundReason:
            updatedOrder.refundReason,
          reason:
            reason || "Administrative decision",
        },
      });
    } else {
      await AuditService.refundRejected({
        actorId,
        actorRole,
        entityId: updatedOrder.id,
        oldValues: {
          status: currentOrder.status,
          refundStatus:
            currentOrder.refundStatus,
          refundReason:
            currentOrder.refundReason,
        },
        newValues: {
          status: updatedOrder.status,
          refundStatus:
            updatedOrder.refundStatus,
          refundReason:
            updatedOrder.refundReason,
          reason:
            reason || "Administrative decision",
        },
      });
    }

    return updatedOrder;
  }

}







