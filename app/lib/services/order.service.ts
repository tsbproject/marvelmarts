import { Prisma } from "@prisma/client";
import { prisma } from "@/app/lib/prisma";
import { InventoryService } from "@/app/lib/services/inventory.service";
import { notFound,badRequest, forbidden } from "@/app/lib/auth/errors";


import {
  sendAdminOrderNotification,
  sendOrderConfirmationEmail,
} from "@/app/lib/mailer";

import { mapOrderToOrderConfirmationEmail } from "@/app/lib/mail/mappers/order.mapper";


type CreateOrderParams = {
  orderNumber: string;

  userId: string;

  vendorProfileId: string;

  formData: any;

  orderItems: any[];

  normalizedItems: any[];

  subtotal: number;

  shipping: number;

  total: number;
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
    total,
  }: CreateOrderParams
) { 

const createdOrder =
          await tx.order.create({
            data: {
              orderNumber,

              userId,

              vendorProfileId,

              email: formData.email,

              firstName: formData.firstName,

              lastName: formData.lastName,

              phone: formData.phone || null,

              streetAddress:
                formData.streetAddress,

              apartment:
                formData.apartment || null,

              city: formData.city,

              state: formData.state,

              orderNotes:
                formData.orderNotes || null,

              useDifferentShipping:
                formData.useDifferentShipping,

              shippingFirstName:
                formData.useDifferentShipping
                  ? formData.shippingDetails
                      .firstName || null
                  : formData.firstName,

              shippingLastName:
                formData.useDifferentShipping
                  ? formData.shippingDetails
                      .lastName || null
                  : formData.lastName,

              shippingAddress:
                formData.useDifferentShipping
                  ? formData.shippingDetails
                      .streetAddress || null
                  : formData.streetAddress,

              shippingCity:
                formData.useDifferentShipping
                  ? formData.shippingDetails
                      .city || null
                  : formData.city,

              shippingState:
                formData.useDifferentShipping
                  ? formData.shippingDetails
                      .state || null
                  : formData.state,

              subtotal,

              shipping,

              total,

              status: "pending",

              paymentStatus: false,

              items: {
                create: orderItems,
              },
            },

            include: {
              items: true,
            },
          });

        
        
    

        return createdOrder;
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
            orders: {
              orderBy: {
                createdAt: "desc",
              },
              include: {
                items: {
                  take: 1,
                },
                user: {
                  select: {
                    name: true,
                    image: true,
                    email: true,
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

      return vendor;
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

    static async updateOrderStatus(
      orderId: string,
      status: string,
      trackingNumber: string | null
    ) {
      return prisma.order.update({
        where: {
          id: orderId,
        },
        data: {
          status,
          trackingNumber,
        },
      });
    }

    static async getVendorOrderDetails(
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
            items: {
              include: {
                product: {
                  select: {
                    title: true,
                    images: {
                      take: 1,
                      select: {
                        url: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

      if (!order) {
        throw notFound(
          "Order not found."
        );
      }

      return order;
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

            const movingToDelivered =
              previousStatus !==
                "DELIVERED" &&
              nextStatus ===
                "DELIVERED";

            if (
              movingToDelivered &&
              existingOrder.vendorProfileId
            ) {
              await tx.vendorProfile.update({
                where: {
                  id: existingOrder.vendorProfileId,
                },
                data: {
                  balance: {
                    increment: Number(
                      existingOrder.total
                    ),
                  },
                },
              });
            }

            return order;
          }
        );

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

            if (
              movingToDelivered &&
              order.vendorProfileId
            ) {
              await tx.vendorProfile.update({
                where: {
                  id: order.vendorProfileId,
                },
                data: {
                  balance: {
                    increment: Number(
                      order.total
                    ),
                  },
                },
              });
            }

            return result;
          }
        );

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

      return updatedOrder;
    }


    static async processOrderRefund(
      orderId: string,
      action: "approved" | "rejected",
      adminNote: string
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

      return updatedOrder;
    }


static async completePaidOrder(
  orderId: string,
  paymentReference?: string
) {
  const order = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
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
      throw notFound("Order not found.");
    }

    if (order.paymentStatus) {
      return order;
    }

    await tx.order.update({
      where: {
        id: orderId,
      },
      data: {
        paymentStatus: true,
        status: "processing",
        ...(paymentReference
          ? {
              paymentIntentId: paymentReference,
            }
          : {}),
      },
    });

    await tx.vendorProfile.update({
      where: {
        id: order.vendorProfileId,
      },
      data: {
        balance: {
          increment: Number(order.subtotal),
        },
      },
    });

    if (order.userId) {
      await tx.cartItem.deleteMany({
        where: {
          cart: {
            userId: order.userId,
          },
        },
      });
    }

    const inventoryItems = order.items
      .filter(
        (
          item
        ): item is typeof item & {
          productId: string;
        } => item.productId !== null
      )
      .map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.qty,
      }));

    await InventoryService.decrementStock(
      tx,
      inventoryItems
    );

    return order;
  });

  try {
    if (!order.emailSent) {
      await Promise.all([
        sendOrderConfirmationEmail(
          mapOrderToOrderConfirmationEmail(order)
        ),
        sendAdminOrderNotification(order),
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
    console.error(
      "ORDER_EMAIL_ERROR:",
      mailError?.message ?? mailError
    );
  }

  return order;
}
   

}