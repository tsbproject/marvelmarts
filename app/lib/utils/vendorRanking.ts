/**
 * MarvelMarts Vendor Ranking Engine
 *
 * Single policy boundary for vendor ranking.
 *
 * Sales-count thresholds:
 *   Bronze: 0–99 sales
 *   Silver: 100–500 sales
 *   Gold:   501+ sales
 *
 * Performance score:
 *   Sales          45%
 *   Retention      30%
 *   Fulfillment    15%
 *   Satisfaction   10%
 *
 * This module calculates ranking policy only.
 * It does not mutate the database.
 */

import { VendorTier } from "@prisma/client";

export type VendorPerformanceMetrics = {
  salesPerformance: number;
  customerRetention: number;
  fulfillmentReliability: number;
  customerSatisfaction: number;
};

export type VendorPerformanceWeights = {
  salesPerformance: number;
  customerRetention: number;
  fulfillmentReliability: number;
  customerSatisfaction: number;
};

export type VendorTierPolicy = {
  tier: VendorTier;
  minimumSales: number;
  maximumSales: number | null;
  commissionRate: number;
  name: string;
  description: string;
  benefits: readonly string[];
};

export type VendorRankingResult = {
  score: number;
  tier: VendorTier;
  commissionRate: number;
  metrics: VendorPerformanceMetrics;
  weights: VendorPerformanceWeights;
  policy: VendorTierPolicy;
  nextTier: VendorTierPolicy | null;
  pointsToNextTier: number;
};

export const VENDOR_RANKING_WEIGHTS: VendorPerformanceWeights = {
  salesPerformance: 0.45,
  customerRetention: 0.30,
  fulfillmentReliability: 0.15,
  customerSatisfaction: 0.10,
};

export const VENDOR_TIER_POLICIES: readonly VendorTierPolicy[] = [
  {
    tier: VendorTier.BRONZE,
    minimumSales: 0,
    maximumSales: 99,
    commissionRate: 0.10,
    name: "Bronze",
    description: "Standard vendor standing for vendors with fewer than 100 sales.",
    benefits: ["Standard marketplace rates"],
  },
  {
    tier: VendorTier.SILVER,
    minimumSales: 100,
    maximumSales: 500,
    commissionRate: 0.08,
    name: "Silver",
    description: "Higher-performing vendor standing for vendors with 100–500 sales.",
    benefits: [
      "Reduced marketplace commission",
      "Enhanced vendor standing",
    ],
  },
  {
    tier: VendorTier.GOLD,
    minimumSales: 501,
    maximumSales: null,
    commissionRate: 0.06,
    name: "Gold",
    description: "Top-performing vendor standing for vendors with more than 500 sales.",
    benefits: [
      "Lowest marketplace commission",
      "Priority vendor standing",
    ],
  },
] as const;

const clamp = (value: number, minimum = 0, maximum = 100) =>
  Math.min(Math.max(value, minimum), maximum);

export function calculateVendorPerformanceScore(
  metrics: VendorPerformanceMetrics,
  weights: VendorPerformanceWeights = VENDOR_RANKING_WEIGHTS
) {
  const score =
    clamp(metrics.salesPerformance) * weights.salesPerformance +
    clamp(metrics.customerRetention) * weights.customerRetention +
    clamp(metrics.fulfillmentReliability) * weights.fulfillmentReliability +
    clamp(metrics.customerSatisfaction) * weights.customerSatisfaction;

  return Math.round(clamp(score) * 100) / 100;
}

/**
 * Sales count is the authoritative tier boundary.
 */
export function getVendorTierPolicy(
  salesCount: number
): VendorTierPolicy {
  const normalizedSalesCount = Math.max(0, Math.floor(salesCount));

  if (normalizedSalesCount >= 501) {
    return VENDOR_TIER_POLICIES[2];
  }

  if (normalizedSalesCount >= 100) {
    return VENDOR_TIER_POLICIES[1];
  }

  return VENDOR_TIER_POLICIES[0];
}

export function getNextVendorTierPolicy(
  salesCount: number
): VendorTierPolicy | null {
  const policy = getVendorTierPolicy(salesCount);

  if (policy.tier === VendorTier.BRONZE) {
    return VENDOR_TIER_POLICIES[1];
  }

  if (policy.tier === VendorTier.SILVER) {
    return VENDOR_TIER_POLICIES[2];
  }

  return null;
}

export function calculateVendorRanking(
  salesCount: number,
  metrics: VendorPerformanceMetrics
): VendorRankingResult {
  const policy = getVendorTierPolicy(salesCount);
  const nextTier = getNextVendorTierPolicy(salesCount);

  const score = calculateVendorPerformanceScore(metrics);

  const pointsToNextTier =
    nextTier === null
      ? 0
      : Math.max(0, nextTier.minimumSales - Math.max(0, Math.floor(salesCount)));

  return {
    score,
    tier: policy.tier,
    commissionRate: policy.commissionRate,
    metrics,
    weights: VENDOR_RANKING_WEIGHTS,
    policy,
    nextTier,
    pointsToNextTier,
  };
}

/**
 * Ranking documentation exposed to the vendor dashboard.
 */
export const VENDOR_RANKING_DOCUMENTATION = {
  factors: [
    {
      key: "salesPerformance",
      label: "Sales Performance",
      weight: 45,
      description: "Measures completed marketplace sales performance.",
    },
    {
      key: "customerRetention",
      label: "Customer Retention",
      weight: 30,
      description: "Measures the proportion of customers who return to purchase again.",
    },
    {
      key: "fulfillmentReliability",
      label: "Fulfillment Reliability",
      weight: 15,
      description: "Measures successful fulfillment of qualifying orders.",
    },
    {
      key: "customerSatisfaction",
      label: "Customer Satisfaction",
      weight: 10,
      description: "Measures customer ratings and satisfaction.",
    },
  ],
  tiers: VENDOR_TIER_POLICIES,
} as const;
