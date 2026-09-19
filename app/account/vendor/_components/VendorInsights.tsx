"use client";

import React from "react";
import {
  ShieldCheck,
  TrendingUp,
  Users,
  PackageCheck,
  Star,
  ChevronUp,
} from "lucide-react";

import {
  VendorRankingResult,
  VENDOR_RANKING_DOCUMENTATION,
} from "@/app/lib/utils/vendorRanking";

interface VendorInsightsProps {
  ranking: VendorRankingResult;
}

const formatPercent = (value: number) =>
  `${Math.round(value)}%`;

const VendorInsights = ({
  ranking,
}: VendorInsightsProps) => {
  const {
    score,
    tier,
    commissionRate,
    metrics,
    policy,
    nextTier,
    pointsToNextTier,
  } = ranking;

  const metricCards = [
    {
      label: "Sales Performance",
      value: metrics.salesPerformance,
      icon: <TrendingUp size={17} />,
    },
    {
      label: "Customer Retention",
      value: metrics.customerRetention,
      icon: <Users size={17} />,
    },
    {
      label: "Fulfillment Reliability",
      value: metrics.fulfillmentReliability,
      icon: <PackageCheck size={17} />,
    },
    {
      label: "Customer Satisfaction",
      value: metrics.customerSatisfaction,
      icon: <Star size={17} />,
    },
  ];

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* RANKING SUMMARY */}
      <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-gray">
              Vendor Performance Ranking
            </p>

            <div className="flex items-center gap-3 mt-3">
              <ShieldCheck className="text-[#F7931E]" size={28} />

              <h3 className="text-2xl md:text-3xl font-black italic uppercase text-accent-navy">
                {policy.name}
              </h3>
            </div>

            <p className="text-xs text-neutral-gray mt-2 max-w-xl leading-6">
              {policy.description}
            </p>
          </div>

          <div className="text-left md:text-right">
            <p className="text-[9px] font-black uppercase tracking-widest text-neutral-gray">
              Ranking Score
            </p>

            <p className="text-4xl font-black italic text-accent-navy mt-1">
              {score.toFixed(1)}
              <span className="text-sm text-neutral-gray not-italic">
                /100
              </span>
            </p>
          </div>
        </div>

        {/* SCORE BAR */}
        <div className="mt-7">
          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-neutral-gray mb-2">
            <span>Current Performance</span>
            <span>{formatPercent(score)}</span>
          </div>

          <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full bg-accent-navy rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(100, Math.max(0, score))}%`,
              }}
            />
          </div>
        </div>

        {/* PERFORMANCE FACTORS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-7">
          {metricCards.map((metric) => (
            <div
              key={metric.label}
              className="bg-[#FBFBFB] rounded-2xl border border-gray-100 p-4"
            >
              <div className="flex items-center gap-2 text-accent-navy">
                {metric.icon}
                <span className="text-[8px] font-black uppercase tracking-wider">
                  {metric.label}
                </span>
              </div>

              <p className="text-xl font-black italic text-accent-navy mt-3">
                {formatPercent(metric.value)}
              </p>
            </div>
          ))}
        </div>

        {/* NEXT TIER */}
        {nextTier ? (
          <div className="mt-6 p-5 rounded-2xl bg-[#002B5B] text-white">
            <div className="flex items-center gap-2">
              <ChevronUp size={17} />
              <p className="text-[9px] font-black uppercase tracking-widest text-blue-200">
                Next Tier: {nextTier.name}
              </p>
            </div>

            <p className="text-sm font-bold mt-2">
              {pointsToNextTier.toFixed(1)} more ranking points needed.
            </p>

            <p className="text-[10px] text-blue-200 mt-1">
              Commission at {nextTier.name} tier:{" "}
              {(nextTier.commissionRate * 100).toFixed(0)}%
            </p>
          </div>
        ) : (
          <div className="mt-6 p-5 rounded-2xl bg-[#002B5B] text-white">
            <p className="text-[9px] font-black uppercase tracking-widest text-blue-200">
              Highest Vendor Tier
            </p>

            <p className="text-sm font-bold mt-2">
              You are currently at the highest ranking tier.
            </p>
          </div>
        )}
      </div>

      {/* COMMISSION + DOCUMENTATION */}
      <div className="bg-[#002B5B] p-6 md:p-7 rounded-[2.5rem] shadow-xl text-white">
        <p className="text-[9px] font-black text-blue-300 uppercase tracking-[0.2em]">
          Current Marketplace Rate
        </p>

        <p className="text-5xl font-black italic mt-3">
          {(commissionRate * 100).toFixed(0)}%
        </p>

        <p className="text-[10px] text-blue-200 uppercase tracking-widest mt-1">
          {policy.name} Tier Commission
        </p>

        <div className="mt-7 border-t border-white/10 pt-6">
          <p className="text-[9px] font-black uppercase tracking-widest text-blue-300">
            Tier Benefits
          </p>

          <ul className="mt-4 space-y-3">
            {policy.benefits.map((benefit) => (
              <li
                key={benefit}
                className="flex items-start gap-2 text-[10px] leading-5"
              >
                <ShieldCheck
                  size={14}
                  className="text-green-400 mt-0.5 shrink-0"
                />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-7 border-t border-white/10 pt-6">
          <p className="text-[9px] font-black uppercase tracking-widest text-blue-300">
            Ranking Model
          </p>

          <div className="mt-4 space-y-3">
            {VENDOR_RANKING_DOCUMENTATION.factors.map((factor) => (
              <div
                key={factor.label}
                className="text-[10px]"
              >
                <div className="flex justify-between gap-3">
                  <span className="text-blue-100">
                    {factor.label}
                  </span>

                  <span className="font-black">
                    {Math.round(factor.weight * 100)}%
                  </span>
                </div>

                <p className="text-[9px] text-blue-200 mt-1 leading-4">
                  {factor.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorInsights;



