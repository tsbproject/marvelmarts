import { prisma } from "@/app/lib/prisma";
import {
  calculateVendorRanking,
  type VendorPerformanceMetrics,
  type VendorRankingResult,
} from "@/app/lib/utils/vendorRanking";

const PERFORMANCE_ORDER_STATUSES = [
  "DELIVERED",
  "COMPLETED",
  "SUCCESS",
  "PAID",
] as const;

export type VendorPerformanceSnapshot = {
  vendorProfileId: string;
  metrics: VendorPerformanceMetrics;
  ranking: VendorRankingResult;
  source: {
    qualifyingOrders: number;
    uniqueCustomers: number;
    repeatCustomers: number;
    deliveredOrders: number;
    completedOrders: number;
    totalOrdersConsidered: number;
    totalSalesAmount: number;
    reviewsCount: number;
    averageRating: number;
  };
};

function clampScore(
  value: number,
  minimum = 0,
  maximum = 100
): number {
  if (!Number.isFinite(value)) {
    return minimum;
  }

  return Math.min(
    Math.max(value, minimum),
    maximum
  );
}

/**
 * Sales performance uses the agreed sales-count progression.
 *
 * 0 sales   -> 0
 * 100 sales -> 100
 * 100+      -> capped at 100
 *
 * Commercial tier boundaries remain:
 * Bronze: 0–99
 * Silver: 100–500
 * Gold:   501+
 */
function calculateSalesPerformance(
  salesCount: number
): number {
  const normalizedSalesCount = Math.max(
    0,
    Math.floor(salesCount)
  );

  if (normalizedSalesCount <= 0) {
    return 0;
  }

  return clampScore(
    normalizedSalesCount
  );
}

function calculateRetention(
  customerOrderCounts: Array<{
    userId: string | null;
    _count: {
      userId: number;
    };
  }>
): {
  uniqueCustomers: number;
  repeatCustomers: number;
  retentionRate: number;
} {
  const customerGroups =
    customerOrderCounts.filter(
      (customer) => Boolean(customer.userId)
    );

  const uniqueCustomers =
    customerGroups.length;

  const repeatCustomers =
    customerGroups.filter(
      (customer) =>
        customer._count.userId > 1
    ).length;

  const retentionRate =
    uniqueCustomers > 0
      ? (repeatCustomers / uniqueCustomers) * 100
      : 0;

  return {
    uniqueCustomers,
    repeatCustomers,
    retentionRate:
      clampScore(retentionRate),
  };
}

function calculateFulfillmentReliability(
  totalOrders: number,
  deliveredOrders: number
): number {
  if (totalOrders <= 0) {
    return 100;
  }

  return clampScore(
    (deliveredOrders / totalOrders) * 100
  );
}

function calculateCustomerSatisfaction(
  averageRating: number
): number {
  if (
    !Number.isFinite(averageRating) ||
    averageRating <= 0
  ) {
    return 0;
  }

  return clampScore(
    (averageRating / 5) * 100
  );
}

export const VendorRankingService = {
  async calculateVendorPerformance(
    vendorProfileId: string
  ): Promise<VendorPerformanceSnapshot> {
    const [
      qualifyingOrders,
      customerOrderCounts,
      deliveredOrders,
      completedOrders,
      vendorProducts,
    ] = await Promise.all([
      prisma.vendorOrder.findMany({
        where: {
          vendorProfileId,
          status: {
            in: [
              ...PERFORMANCE_ORDER_STATUSES,
            ],
          },
        },
        select: {
          id: true,
          merchandiseSubtotal: true,
          status: true,
          createdAt: true,
          order: { select: { userId: true } },
        },
      }),

      prisma.vendorOrder.findMany({
        where: {
          vendorProfileId,
          status: {
            in: [
              ...PERFORMANCE_ORDER_STATUSES,
            ],
          },
        },
        select: {
          order: { select: { userId: true } },
        },
      }),

      prisma.vendorOrder.count({
        where: {
          vendorProfileId,
          status: "DELIVERED",
        },
      }),

      prisma.vendorOrder.count({
        where: {
          vendorProfileId,
          status: "COMPLETED",
        },
      }),

      prisma.product.findMany({
        where: {
          vendorProfileId,
        },
        select: {
          id: true,
          rating: true,
          ratingCount: true,
          salesCount: true,
        },
      }),
    ]);

    const totalSalesAmount =
      qualifyingOrders.reduce(
        (sum, order) =>
          sum + Number(order.merchandiseSubtotal || 0),
        0
      );

    const salesCount =
      qualifyingOrders.length;

    const customerCounts = new Map<string, number>();
    customerOrderCounts.forEach((vendorOrder) => {
      const customerId = vendorOrder.order.userId;
      if (customerId) {
        customerCounts.set(customerId, (customerCounts.get(customerId) ?? 0) + 1);
      }
    });

    const retention = calculateRetention(
      [...customerCounts.entries()].map(([userId, count]) => ({
        userId,
        _count: { userId: count },
      }))
    );

    const totalOrdersConsidered =
      qualifyingOrders.length;

    const fulfillmentReliability =
      calculateFulfillmentReliability(
        totalOrdersConsidered,
        deliveredOrders
      );

    const totalReviewCount =
      vendorProducts.reduce(
        (sum, product) =>
          sum +
          Number(
            product.ratingCount || 0
          ),
        0
      );

    const weightedRatingTotal =
      vendorProducts.reduce(
        (sum, product) =>
          sum +
          Number(product.rating || 0) *
            Number(
              product.ratingCount || 0
            ),
        0
      );

    const averageRating =
      totalReviewCount > 0
        ? weightedRatingTotal /
          totalReviewCount
        : 0;

    const customerSatisfaction =
      calculateCustomerSatisfaction(
        averageRating
      );

    const salesPerformance =
      calculateSalesPerformance(
        salesCount
      );

    const metrics: VendorPerformanceMetrics = {
      salesPerformance,
      customerRetention:
        retention.retentionRate,
      fulfillmentReliability,
      customerSatisfaction,
    };

    const ranking =
      calculateVendorRanking(
        salesCount,
        metrics
      );

    return {
      vendorProfileId,
      metrics,
      ranking,
      source: {
        qualifyingOrders:
          qualifyingOrders.length,
        uniqueCustomers:
          retention.uniqueCustomers,
        repeatCustomers:
          retention.repeatCustomers,
        deliveredOrders,
        completedOrders,
        totalOrdersConsidered,
        totalSalesAmount,
        reviewsCount:
          totalReviewCount,
        averageRating,
      },
    };
  },

  /**
   * Synchronize the calculated ranking into the persisted VendorScore.
   *
   * This is intentionally separate from calculateVendorPerformance()
   * so analytics reads do not mutate financial/commercial state.
   */
  async syncVendorScore(
    vendorProfileId: string
  ) {
    const snapshot =
      await this.calculateVendorPerformance(
        vendorProfileId
      );

    const { ranking, source } =
      snapshot;

    const vendorScore =
      await prisma.vendorScore.upsert({
        where: {
          vendorProfileId,
        },
        create: {
          vendorProfileId,
          tier: ranking.tier,
          commissionRate:
            ranking.commissionRate,
          fulfillmentRate:
            Math.round(
              ranking.metrics
                .fulfillmentReliability
            ),
          rating:
            source.averageRating,
          reviewsCount:
            source.reviewsCount,
        },
        update: {
          tier: ranking.tier,
          commissionRate:
            ranking.commissionRate,
          fulfillmentRate:
            Math.round(
              ranking.metrics
                .fulfillmentReliability
            ),
          rating:
            source.averageRating,
          reviewsCount:
            source.reviewsCount,
        },
      });

    return {
      snapshot,
      vendorScore,
    };
  },
};
