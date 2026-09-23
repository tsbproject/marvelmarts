import { prisma } from "@/app/lib/prisma";
import {
  badRequest,
  conflict,
  notFound,
} from "@/app/lib/auth/errors";
import { AuditService } from "@/app/lib/services/logging/audit.service";

export class CourierService {
  static async getActiveCouriers() {
    return prisma.courier.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          name: "asc",
        },
      ],
    });
  }

  static async getAllCouriers() {
    return prisma.courier.findMany({
      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          name: "asc",
        },
      ],
    });
  }

  static async getCourierById(courierId: string) {
    if (!courierId?.trim()) {
      throw badRequest("Courier ID is required.");
    }

    return prisma.courier.findUnique({
      where: {
        id: courierId,
      },
    });
  }

  static async getCourierByIdOrThrow(courierId: string) {
    const courier = await this.getCourierById(courierId);

    if (!courier) {
      throw notFound("Courier not found.");
    }

    return courier;
  }

  static async createCourier(
    data: {
      name: string;
      code: string;
      description?: string;
      logoUrl?: string;
      websiteUrl?: string;
      sortOrder?: number;
    },
    actorId: string
  ) {
    const name = data.name?.trim();
    const code = data.code?.trim().toUpperCase();

    if (!name) {
      throw badRequest("Courier name is required.");
    }

    if (!code) {
      throw badRequest("Courier code is required.");
    }

    if (data.sortOrder !== undefined) {
      if (
        !Number.isInteger(data.sortOrder) ||
        data.sortOrder < 0
      ) {
        throw badRequest(
          "Courier sort order must be a non-negative integer."
        );
      }
    }

    const existing = await prisma.courier.findUnique({
      where: {
        code,
      },
    });

    if (existing) {
      throw conflict("A courier with this code already exists.");
    }

    const courier = await prisma.courier.create({
      data: {
        name,
        code,
        description: data.description?.trim() || null,
        logoUrl: data.logoUrl?.trim() || null,
        websiteUrl: data.websiteUrl?.trim() || null,
        sortOrder: data.sortOrder ?? 0,
      },
    });

    await AuditService.courierCreated({
      actorId,
      entityId: courier.id,
      newValues: {
        name: courier.name,
        code: courier.code,
        description: courier.description,
        logoUrl: courier.logoUrl,
        websiteUrl: courier.websiteUrl,
        sortOrder: courier.sortOrder,
        isActive: courier.isActive,
      },
    });

    return courier;
  }

  static async updateCourier(
    courierId: string,
    data: {
      name?: string;
      code?: string;
      description?: string | null;
      logoUrl?: string | null;
      websiteUrl?: string | null;
      sortOrder?: number;
    },
    actorId: string
  ) {
    const existing = await this.getCourierByIdOrThrow(courierId);

    const updateData: {
      name?: string;
      code?: string;
      description?: string | null;
      logoUrl?: string | null;
      websiteUrl?: string | null;
      sortOrder?: number;
    } = {};

    if (data.name !== undefined) {
      const name = data.name.trim();

      if (!name) {
        throw badRequest("Courier name cannot be empty.");
      }

      updateData.name = name;
    }

    if (data.code !== undefined) {
      const code = data.code.trim().toUpperCase();

      if (!code) {
        throw badRequest("Courier code cannot be empty.");
      }

      if (code !== existing.code) {
        const duplicate = await prisma.courier.findUnique({
          where: {
            code,
          },
        });

        if (duplicate) {
          throw conflict(
            "A courier with this code already exists."
          );
        }
      }

      updateData.code = code;
    }

    if (data.description !== undefined) {
      updateData.description =
        data.description?.trim() || null;
    }

    if (data.logoUrl !== undefined) {
      updateData.logoUrl =
        data.logoUrl?.trim() || null;
    }

    if (data.websiteUrl !== undefined) {
      updateData.websiteUrl =
        data.websiteUrl?.trim() || null;
    }

    if (data.sortOrder !== undefined) {
      if (
        !Number.isInteger(data.sortOrder) ||
        data.sortOrder < 0
      ) {
        throw badRequest(
          "Courier sort order must be a non-negative integer."
        );
      }

      updateData.sortOrder = data.sortOrder;
    }

    if (Object.keys(updateData).length === 0) {
      return existing;
    }

    const courier = await prisma.courier.update({
      where: {
        id: courierId,
      },
      data: updateData,
    });

    await AuditService.courierUpdated({
      actorId,
      entityId: courier.id,
      oldValues: {
        name: existing.name,
        code: existing.code,
        description: existing.description,
        logoUrl: existing.logoUrl,
        websiteUrl: existing.websiteUrl,
        sortOrder: existing.sortOrder,
        isActive: existing.isActive,
      },
      newValues: {
        name: courier.name,
        code: courier.code,
        description: courier.description,
        logoUrl: courier.logoUrl,
        websiteUrl: courier.websiteUrl,
        sortOrder: courier.sortOrder,
        isActive: courier.isActive,
      },
    });

    return courier;
  }

  static async setCourierActive(
    courierId: string,
    isActive: boolean,
    actorId: string
  ) {
    const existing = await this.getCourierByIdOrThrow(
      courierId
    );

    if (existing.isActive === isActive) {
      return existing;
    }

    const courier = await prisma.courier.update({
      where: {
        id: courierId,
      },
      data: {
        isActive,
      },
    });

    await AuditService.courierStatusChanged({
      actorId,
      entityId: courier.id,
      oldValues: {
        isActive: existing.isActive,
      },
      newValues: {
        isActive: courier.isActive,
      },
    });

    return courier;
  }
}