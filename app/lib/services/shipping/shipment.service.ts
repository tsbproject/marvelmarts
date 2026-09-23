import { prisma } from "@/app/lib/prisma";
import { badRequest, notFound } from "@/app/lib/auth/errors";

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

    const shipment = await prisma.$transaction(
      async (tx) => {
        const vendorOrder =
          await tx.vendorOrder.findUnique({
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
          throw notFound(
            "Vendor order not found."
          );
        }

        if (vendorOrder.status !== "APPROVED") {
          throw badRequest(
            "Only approved vendor orders can have a shipment created."
          );
        }

        if (courierId) {
          const courier =
            await tx.courier.findUnique({
              where: {
                id: courierId,
              },
              select: {
                id: true,
                isActive: true,
              },
            });

          if (!courier) {
            throw notFound(
              "Courier not found."
            );
          }

          if (!courier.isActive) {
            throw badRequest(
              "Selected courier is not active."
            );
          }
        }

        const shipment =
          await tx.shipment.create({
            data: {
              orderId: vendorOrder.orderId,
              vendorOrderId,
              courierId: courierId || null,
              trackingNumber:
                trackingNumber?.trim() || null,
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
      }
    );

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

    const shipment =
      await prisma.shipment.findUnique({
        where: {
          id: shipmentId,
        },
        select: {
          id: true,
          status: true,
        },
      });

    if (!shipment) {
      throw notFound("Shipment not found.");
    }

    if (shipment.status === nextStatus) {
      throw badRequest(
        `Shipment is already ${nextStatus}.`
      );
    }

    const allowedTransitions: Record<
      string,
      string[]
    > = {
      PENDING: ["SHIPPED", "CANCELLED", "FAILED"],
      SHIPPED: ["IN_TRANSIT", "CANCELLED", "FAILED"],
      IN_TRANSIT: [
        "OUT_FOR_DELIVERY",
        "CANCELLED",
        "FAILED",
        "RETURNED",
      ],
      OUT_FOR_DELIVERY: [
        "DELIVERED",
        "FAILED",
        "RETURNED",
      ],
      DELIVERED: [],
      CANCELLED: [],
      FAILED: [],
      RETURNED: [],
    };

    const allowed =
      allowedTransitions[shipment.status] ?? [];

    if (!allowed.includes(nextStatus)) {
      throw badRequest(
        `Shipment cannot move from ${shipment.status} to ${nextStatus}.`
      );
    }

    const now = new Date();

    return prisma.$transaction(async (tx) => {
      const updatedShipment =
        await tx.shipment.update({
          where: {
            id: shipmentId,
          },
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
          location:
            location?.trim() || null,
          occurredAt: now,
        },
      });

      return updatedShipment;
    });
  }
}