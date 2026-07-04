import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { requireAdmin } from "@/app/lib/auth/api";
import { badRequest } from "@/app/lib/auth/errors";
import { handleApiError } from "@/app/lib/auth/api";

export async function PATCH(req: Request) {
  try {
    await requireAdmin();

    const {
      ids = [],
      updateType,
      applyToAll = false,
      filters,
    } = await req.json();

    const fieldMapping = {
      isFeatured: "isFeatured",
      isFlashSale: "isFlashSale",
      isNew: "isNewArrival",
      isNewArrival: "isNewArrival",
    } as const;

    const dbField = fieldMapping[
      updateType as keyof typeof fieldMapping
    ];

    if (!dbField) {
      throw badRequest("Invalid update type.");
    }

    let targetIds: string[] = [];

    if (applyToAll && filters) {
      const where: Record<string, unknown> = {};

      if (filters.search) {
        const searchConstraint = {
          contains: filters.search,
          mode: "insensitive" as const,
        };

        switch (filters.searchType) {
          case "title":
            where.title = searchConstraint;
            break;

          case "category":
            where.category = {
              name: searchConstraint,
            };
            break;

          case "vendor":
            where.vendorProfile = {
              storeName: searchConstraint,
            };
            break;

          default:
            where.OR = [
              {
                title: searchConstraint,
              },
              {
                category: {
                  name: searchConstraint,
                },
              },
              {
                vendorProfile: {
                  storeName: searchConstraint,
                },
              },
            ];
        }
      }

      if (filters.filter === "featured") {
        where.isFeatured = true;
      }

      if (filters.filter === "new") {
        where.isNewArrival = true;
      }

      if (filters.filter === "flash") {
        where.isFlashSale = true;
      }

      const products = await prisma.product.findMany({
        where,
        select: {
          id: true,
        },
      });

      targetIds = products.map((product) => product.id);
    } else {
      targetIds = ids;
    }

    if (targetIds.length === 0) {
      throw badRequest("No products selected.");
    }

    const currentProducts = await prisma.product.findMany({
      where: {
        id: {
          in: targetIds,
        },
      },
      select: {
        id: true,
        isFeatured: true,
        isFlashSale: true,
        isNewArrival: true,
      },
    });

    await prisma.$transaction(
      currentProducts.map((product) => {
        let value = false;

        switch (dbField) {
          case "isFeatured":
            value = !product.isFeatured;
            break;

          case "isFlashSale":
            value = !product.isFlashSale;
            break;

          case "isNewArrival":
            value = !product.isNewArrival;
            break;
        }

        return prisma.product.update({
          where: {
            id: product.id,
          },
          data: {
            [dbField]: value,
          },
        });
      })
    );

    return NextResponse.json({
      success: true,
      message: `Updated ${targetIds.length} products.`,
      affectedIds: targetIds,
    });
  } catch (error) {
    return handleApiError(error);
  }
}