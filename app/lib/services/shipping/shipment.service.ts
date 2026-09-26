import crypto from "crypto";
import { prisma } from "@/app/lib/prisma";
import { badRequest, notFound } from "@/app/lib/auth/errors";
import { VendorOrderSettlementService } from "@/app/lib/services/finance/vendor-order-settlement.service";
import {
  sendShipmentStatusNotificationEmail,
  sendDeliveryConfirmationEmail,
} from "@/app/lib/mailer";

import { logger } from "@/app/lib/logger";


export class ShipmentService {
  
  static async getShipmentById(
    shipmentId: string
  ) {
    if (!shipmentId?.trim()) {
      throw badRequest("Shipment ID is required.");
    }

    const shipment =
      await prisma.shipment.findUnique({
        where: {
          id: shipmentId,
        },
        include: {
          courier: true,
          vendorOrder: {
            select: {
              id: true,
              orderId: true,
              vendorProfileId: true,
              status: true,
            },
          },
        },
      });

    if (!shipment) {
      throw notFound("Shipment not found.");
    }

    return shipment;
  }

  static async getShipmentsByVendorOrder(
    vendorOrderId: string
  ) {
    if (!vendorOrderId?.trim()) {
      throw badRequest(
        "Vendor order ID is required."
      );
    }

    return prisma.shipment.findMany({
      where: {
        vendorOrderId,
      },
      orderBy: {
        createdAt: "asc",
      },
      include: {
        courier: true,
      },
    });
  }

  static async getTrackingHistory(
    shipmentId: string
  ) {
    if (!shipmentId?.trim()) {
      throw badRequest("Shipment ID is required.");
    }

    const shipment =
      await prisma.shipment.findUnique({
        where: {
          id: shipmentId,
        },
        select: {
          id: true,
        },
      });

    if (!shipment) {
      throw notFound("Shipment not found.");
    }

    return prisma.shipmentEvent.findMany({
      where: {
        shipmentId,
      },
      orderBy: {
        occurredAt: "asc",
      },
    });
  }

    static async createShipment({
    vendorOrderId,
    courierId,
    trackingNumber,
    }: {
      vendorOrderId: string;
      courierId?: string;
      trackingNumber?: string;
    }) {
      if (!vendorOrderId?.trim()) {
        throw badRequest("Vendor order ID is required.");
      }

      const shipment = await prisma.$transaction(async (tx) => {
        const vendorOrder = await tx.vendorOrder.findUnique({
          where: {
            id: vendorOrderId,
          },
          select: {
            id: true,
            orderId: true,
            status: true,
          },
        });

        if (!vendorOrder) {
          throw notFound("Vendor order not found.");
        }

        if (vendorOrder.status !== "APPROVED") {
          throw badRequest(
            "Only approved vendor orders can have a shipment created."
          );
        }

        let selectedCourier:
          | {
              id: string;
              code: string;
              isActive: boolean;
            }
          | null = null;

        if (courierId) {
          selectedCourier = await tx.courier.findUnique({
            where: {
              id: courierId,
            },
            select: {
              id: true,
              code: true,
              isActive: true,
            },
          });

          if (!selectedCourier) {
            throw notFound("Courier not found.");
          }

          if (!selectedCourier.isActive) {
            throw badRequest("Selected courier is not active.");
          }
        }

        const normalizedTrackingNumber =
          trackingNumber?.trim() || null;

        if (
          selectedCourier?.code === "MARVELMARTS" &&
          normalizedTrackingNumber
        ) {
          throw badRequest(
            "MarvelMarts Logistics generates its tracking number automatically."
          );
        }

        let generatedTrackingNumber: string | null =
          normalizedTrackingNumber;

        if (selectedCourier?.code === "MARVELMARTS") {
          const now = new Date();

          const datePart =
            now.toISOString().slice(0, 10).replace(/-/g, "");

          let attempts = 0;

          while (!generatedTrackingNumber && attempts < 5) {
            attempts += 1;

            const randomPart = crypto
              .randomBytes(4)
              .toString("hex")
              .toUpperCase();

            const candidate =
              `MM-${datePart}-${randomPart}`;

            const existing = await tx.shipment.findFirst({
              where: {
                trackingNumber: candidate,
              },
              select: {
                id: true,
              },
            });

            if (!existing) {
              generatedTrackingNumber = candidate;
            }
          }

          if (!generatedTrackingNumber) {
            throw badRequest(
              "Unable to generate a unique MarvelMarts tracking number."
            );
          }
        }

        const shipment = await tx.shipment.create({
          data: {
            orderId: vendorOrder.orderId,
            vendorOrderId,
            courierId: courierId || null,
            trackingNumber: generatedTrackingNumber,
            status: "PENDING",
          },
        });

        await tx.shipmentEvent.create({
          data: {
            shipmentId: shipment.id,
            status: "PENDING",
            description: "Shipment created.",
            occurredAt: new Date(),
          },
        });

        return shipment;
      });

      return shipment;
    }

  static async updateShipmentStatus(
  shipmentId: string,
  nextStatus:
    | "PENDING"
    | "SHIPPED"
    | "IN_TRANSIT"
    | "OUT_FOR_DELIVERY"
    | "DELIVERED"
    | "CANCELLED"
    | "FAILED"
    | "RETURNED",
  description?: string,
  location?: string
) {
  if (!shipmentId?.trim()) {
    throw badRequest("Shipment ID is required.");
  }

  const shipment = await prisma.shipment.findUnique({
    where: { id: shipmentId },
    select: {
      id: true,
      orderId: true,
      status: true,
      vendorOrderId: true,
      trackingNumber: true,
    },
  });

  if (!shipment) {
    throw notFound("Shipment not found.");
  }

  if (shipment.status === nextStatus) {
    throw badRequest(`Shipment is already ${nextStatus}.`);
  }

  const allowedTransitions: Record<string, string[]> = {
    PENDING: ["SHIPPED", "CANCELLED", "FAILED"],
    SHIPPED: ["IN_TRANSIT", "CANCELLED", "FAILED"],
    IN_TRANSIT: [
      "OUT_FOR_DELIVERY",
      "CANCELLED",
      "FAILED",
      "RETURNED",
    ],
    OUT_FOR_DELIVERY: ["DELIVERED", "FAILED", "RETURNED"],
    DELIVERED: [],
    CANCELLED: [],
    FAILED: [],
    RETURNED: [],
  };

  const allowed = allowedTransitions[shipment.status] ?? [];

  if (!allowed.includes(nextStatus)) {
    throw badRequest(
      `Shipment cannot move from ${shipment.status} to ${nextStatus}.`
    );
  }

  if (
    nextStatus === "SHIPPED" &&
    !shipment.trackingNumber?.trim()
  ) {
    throw badRequest(
      "A tracking number is required before a shipment can be marked as shipped."
    );
  }

  const now = new Date();

  const updatedShipment = await prisma.$transaction(async (tx) => {
    const updatedShipment = await tx.shipment.update({
      where: { id: shipmentId },
      data: {
        status: nextStatus,
        ...(nextStatus === "SHIPPED"
          ? { shippedAt: now }
          : {}),
        ...(nextStatus === "DELIVERED"
          ? { deliveredAt: now }
          : {}),
      },
    });

    await tx.shipmentEvent.create({
      data: {
        shipmentId,
        status: nextStatus,
        description:
          description?.trim() ||
          `Shipment status changed to ${nextStatus}.`,
        location: location?.trim() || null,
        occurredAt: now,
      },
    });

    if (nextStatus === "DELIVERED") {
      await VendorOrderSettlementService
        .markDeliveredAndReleaseVendorBalance(
          shipment.vendorOrderId,
          tx
        );
    }

    return updatedShipment;
  });

  // Customer notification is intentionally sent
  // after the shipment transaction has committed.
  if (
    nextStatus === "SHIPPED" ||
    nextStatus === "IN_TRANSIT" ||
    nextStatus === "OUT_FOR_DELIVERY" ||
    nextStatus === "DELIVERED"
  ) {
    try {
      const order = await prisma.order.findUnique({
        where: {
          id: shipment.orderId,
        },
        select: {
          orderNumber: true,
          firstName: true,
          email: true,
          city: true,
          streetAddress: true,
        },
      });

      if (order?.email) {
        if (
          nextStatus === "SHIPPED" ||
          nextStatus === "IN_TRANSIT" ||
          nextStatus === "OUT_FOR_DELIVERY"
        ) {
          await sendShipmentStatusNotificationEmail({
            orderNumber: order.orderNumber,
            firstName: order.firstName,
            email: order.email,
            trackingNumber: updatedShipment.trackingNumber,
            status: nextStatus,
          });
        }

        if (nextStatus === "DELIVERED") {
          await sendDeliveryConfirmationEmail({
            orderNumber: order.orderNumber,
            firstName: order.firstName,
            email: order.email,
            city: order.city,
            streetAddress: order.streetAddress,
          });
        }
      }
    } catch (error) {
      logger.error("SHIPMENT_EMAIL_ERROR:", error);
    }
  }

  return updatedShipment;
}


  static async setShipmentTrackingNumber(
    shipmentId: string,
    trackingNumber: string
  ) {
    if (!shipmentId?.trim()) {
      throw badRequest("Shipment ID is required.");
    }

    const normalizedTrackingNumber =
      trackingNumber?.trim();

    if (!normalizedTrackingNumber) {
      throw badRequest("Tracking number is required.");
    }

    const shipment = await prisma.shipment.findUnique({
      where: {
        id: shipmentId,
      },
      select: {
        id: true,
        status: true,
        trackingNumber: true,
        courier: {
          select: {
            id: true,
            code: true,
            isActive: true,
          },
        },
      },
    });

    if (!shipment) {
      throw notFound("Shipment not found.");
    }

    if (shipment.status !== "PENDING") {
      throw badRequest(
        "Tracking number can only be assigned while the shipment is pending."
      );
    }

    if (!shipment.courier) {
      throw badRequest(
        "A courier must be assigned before a tracking number can be set."
      );
    }

    if (shipment.courier.code === "MARVELMARTS") {
      throw badRequest(
        "MarvelMarts Logistics generates its tracking number automatically."
      );
    }

    if (shipment.trackingNumber) {
      throw badRequest(
        "This shipment already has a tracking number."
      );
    }

    const existingShipment =
      await prisma.shipment.findFirst({
        where: {
          trackingNumber: normalizedTrackingNumber,
          NOT: {
            id: shipment.id,
          },
        },
        select: {
          id: true,
        },
      });

    if (existingShipment) {
      throw badRequest(
        "This tracking number is already assigned to another shipment."
      );
    }

    return prisma.shipment.update({
      where: {
        id: shipment.id,
      },
      data: {
        trackingNumber: normalizedTrackingNumber,
      },
      include: {
        courier: true,
        vendorOrder: {
          select: {
            id: true,
            orderId: true,
            vendorProfileId: true,
            status: true,
          },
        },
      },
    });
  }
}