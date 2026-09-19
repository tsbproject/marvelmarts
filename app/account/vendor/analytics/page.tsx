import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import DashboardHeader from "@/app/_components/DashboardHeader";
import { VendorService } from "@/app/lib/services/vendor.service";
import { VendorRankingService } from "@/app/lib/services/vendor-ranking.service";

import {
  TrendingUp,
  ArrowLeft,
  ShieldCheck,
  ShoppingBag,
  Package,
  Rocket,
  Users,
  Repeat,
  UserPlus,
  Percent,
  Wallet,
  Landmark,
} from "lucide-react";

import Link from "next/link";

import { formatNaira } from "@/app/lib/FormatNaira";

import {
  startOfDay,
  startOfMonth,
  subDays,
  format,
} from "date-fns";

import RevenueChart from "../_components/RevenueChart";
import VendorInsights from "../_components/VendorInsights";
import CustomerInsightsChart from "../_components/CustomerInsightsChart";

export default async function VendorAnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/sign-in");
  }

  let vendorData;

    try {
      vendorData =
        await VendorService.getVendorAnalyticsProfile(
          session.user.id
        );
    } catch {
      redirect(
        "/auth/register/vendor-registration"
      );
    }

  const vendorRanking =
    await VendorRankingService.calculateVendorPerformance(
      vendorData.id
    );

  const today = startOfDay(new Date());

  const monthStart = startOfMonth(
    new Date()
  );

  const thirtyDaysAgo = subDays(
    today,
    30
  );

  // SAFER STATUS MATCHING
  const revenueStatuses = [
    "DELIVERED",
    "COMPLETED",
    "SUCCESS",
    "PAID",
  ];



const [
  todayRevenue,
  monthRevenue,
  rawRevenueData,
  liveProductsCount,
  deliveredOrdersCount,
  totalCustomers,
  repeatCustomers,
  marketplaceTransactions,
] =
  await VendorService.getVendorAnalyticsDashboard(
    vendorData.id
  );

  //   // TODAY REVENUE
  ;

 
  const dailyDataMap: Record<string, number> = {};

  for (let i = 0; i < 30; i++) {
    dailyDataMap[format(subDays(today, i), "MMM dd")] = 0;
  }

  rawRevenueData.forEach((order) => {
    const dateStr = format(order.createdAt, "MMM dd");

    if (dailyDataMap[dateStr] !== undefined) {
      dailyDataMap[dateStr] += Number(order.merchandiseSubtotal || 0);
    }
  });

  const chartData = Object.entries(dailyDataMap)
    .map(([date, amount]) => ({
      date,
      amount,
    }))
    .reverse();


  // CUSTOMER INSIGHTS
  const customerOrders = totalCustomers.map(
    (vendorOrder) => vendorOrder.order
  );

  const uniqueCustomers = new Set(
    customerOrders
      .filter((order) => order.userId)
      .map((order) => order.userId)
  ).size;

  const customerOrderCounts = new Map<string, number>();
  repeatCustomers.forEach((vendorOrder) => {
    const customerId = vendorOrder.order.userId;
    if (customerId) {
      customerOrderCounts.set(
        customerId,
        (customerOrderCounts.get(customerId) ?? 0) + 1
      );
    }
  });

  const repeatCustomersCount = [...customerOrderCounts.values()]
    .filter((count) => count > 1).length;

  const newCustomersCount = new Set(
    customerOrders
      .filter(
        (order) =>
          order.createdAt >= monthStart &&
          order.userId
      )
      .map((order) => order.userId)
  ).size;

  const retentionRate =
    uniqueCustomers > 0
      ? (
          (repeatCustomersCount / uniqueCustomers) *
          100
        ).toFixed(1)
      : "0";

  // CUSTOMER CHART
  const customerChartData = [
    {
      name: "Customers",
      value: uniqueCustomers,
    },

    {
      name: "Repeat",
      value: repeatCustomersCount,
    },

    {
      name: "New",
      value: newCustomersCount,
    },

    {
      name: "Retention %",
      value: Number(retentionRate),
    },
  ];

  // COMMISSION BREAKDOWN
  const grossRevenue =
    marketplaceTransactions.reduce(
      (acc, tx) =>
        acc + Number(tx.grossAmount || 0),
      0
    );

  const totalPlatformCommission =
    marketplaceTransactions.reduce(
      (acc, tx) =>
        acc + Number(tx.platformFee || 0),
      0
    );

  const vendorNetEarnings =
    marketplaceTransactions.reduce(
      (acc, tx) =>
        acc + Number(tx.netAmount || 0),
      0
    );

  const averageCommissionRate =
    marketplaceTransactions.length > 0
      ? (
          marketplaceTransactions.reduce(
            (acc, tx) =>
              acc + Number(tx.commissionRate || 0),
            0
          ) / marketplaceTransactions.length
        ) * 100
      : 0;

  // KPI CARDS
  const analyticsCards = [
    {
      label: "Today Revenue",
      value: formatNaira(
        Number(todayRevenue._sum.merchandiseSubtotal || 0)
      ),
      icon: <TrendingUp size={20} />,
      color: "bg-green-50 text-green-600",
    },

    {
      label: "Monthly Revenue",
      value: formatNaira(
        Number(monthRevenue._sum.merchandiseSubtotal || 0)
      ),
      icon: <TrendingUp size={20} />,
      color:
        "bg-brand-primary/10 text-brand-primary",
    },

    {
      label: "Live Products",
      value: liveProductsCount,
      icon: <Package size={20} />,
      color: "bg-blue-50 text-blue-600",
    },

    {
      label: "Completed Orders",
      value: deliveredOrdersCount,
      icon: <ShoppingBag size={20} />,
      color: "bg-purple-50 text-purple-600",
    },

    {
      label: "Vendor Tier",
      value:
        vendorData.score?.tier || "BRONZE",
      icon: <ShieldCheck size={20} />,
      color: "bg-orange-50 text-orange-600",
    },

    {
      label: "Boost Credits",
      value:
        vendorData.boost?.credits ?? 0,
      icon: <Rocket size={20} />,
      color: "bg-red-50 text-red-600",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#FBFBFB]">

      <DashboardHeader
        title="Analytics Center"
        showLogout={true}
      />

      <div className="p-4 lg:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

          <div>
            <h1 className="text-2xl md:text-4xl font-black italic uppercase text-accent-navy tracking-tight">
              Analytics Center
            </h1>

            <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.25em] text-neutral-gray mt-2">
              Revenue Intelligence & Performance Monitoring
            </p>
          </div>

          <Link
            href="/account/vendor"
            className="
              inline-flex items-center gap-2
              px-6 py-4
              bg-white border border-gray-100
              rounded-2xl
              text-[10px] font-black uppercase tracking-widest
              text-accent-navy
              hover:bg-gray-50
              transition-all
              shadow-sm
            "
          >
            <ArrowLeft size={16} />
            Back To Dashboard
          </Link>
        </div>

        {/* KPI GRID */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">

          {analyticsCards.map((card) => (
            <div
              key={card.label}
              className="
                bg-white
                p-6
                rounded-[2rem]
                border border-gray-100
                shadow-sm
              "
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${card.color}`}
              >
                {card.icon}
              </div>

              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-gray">
                {card.label}
              </p>

              <h3 className="text-xl md:text-2xl font-black italic text-accent-navy mt-2 tracking-tight">
                {card.value}
              </h3>
            </div>
          ))}
        </div>

        {/* CUSTOMER INSIGHTS */}
        { <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">

          <div className="flex items-center justify-between mb-8">

            <div>
              <h3 className="text-sm md:text-xl font-black text-accent-navy uppercase tracking-tight italic">
                Customer Insights
              </h3>

              <p className="text-[9px] font-bold text-neutral-gray uppercase tracking-widest">
                Customer Growth & Retention Metrics
              </p>
            </div>

            <Users className="text-brand-primary" />
          </div>

          <div className="grid lg:grid-cols-2 gap-8">

            {/* LEFT STATS */}
            <div className="grid grid-cols-2 gap-6">

              <div className="bg-[#FBFBFB] rounded-[2rem] p-6 border border-gray-100">

                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <Users size={20} />
                </div>

                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-gray">
                  Total Customers
                </p>

                <h3 className="text-2xl font-black italic text-accent-navy mt-2">
                  {uniqueCustomers}
                </h3>
              </div>

              <div className="bg-[#FBFBFB] rounded-[2rem] p-6 border border-gray-100">

                <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-4">
                  <Repeat size={20} />
                </div>

                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-gray">
                  Repeat Customers
                </p>

                <h3 className="text-2xl font-black italic text-accent-navy mt-2">
                  {repeatCustomersCount}
                </h3>
              </div>

              <div className="bg-[#FBFBFB] rounded-[2rem] p-6 border border-gray-100">

                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
                  <UserPlus size={20} />
                </div>

                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-gray">
                  New Customers
                </p>

                <h3 className="text-2xl font-black italic text-accent-navy mt-2">
                  {newCustomersCount}
                </h3>
              </div>

              <div className="bg-[#FBFBFB] rounded-[2rem] p-6 border border-gray-100">

                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                  <Percent size={20} />
                </div>

                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-gray">
                  Retention Rate
                </p>

                <h3 className="text-2xl font-black italic text-accent-navy mt-2">
                  {retentionRate}%
                </h3>
              </div>

            </div>

            {/* RIGHT CHART */}
            <div className="bg-[#FBFBFB] rounded-[2rem] border border-gray-100 p-6 h-[400px] flex flex-col">

              <div className="mb-6">
                <h4 className="text-sm font-black uppercase tracking-wide text-accent-navy italic">
                  Customer Analytics
                </h4>

                <p className="text-[9px] uppercase tracking-widest font-bold text-neutral-gray mt-1">
                  Customer Distribution Overview
                </p>
              </div>

              <div className="flex-1">
                <CustomerInsightsChart data={customerChartData} />
              </div>

            </div>

          </div>
        </div>
          }
        
        {/* VENDOR INSIGHTS */}
        <div className="animate-in fade-in slide-in-from-top-4 duration-700">
          <VendorInsights ranking={vendorRanking.ranking} />
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col h-[520px]">

          <div className="flex justify-between items-center mb-8">

            <div>
              <h3 className="text-sm md:text-xl font-black text-accent-navy uppercase tracking-tight italic">
                Performance Graph
              </h3>

              <p className="text-[9px] font-bold text-neutral-gray uppercase tracking-widest">
                Revenue Flow (30 Days)
              </p>
            </div>

            <TrendingUp className="text-brand-primary" />
          </div>

          <div className="flex-1 w-full bg-[#FBFBFB] rounded-3xl border border-gray-100 overflow-hidden mb-8">
            <RevenueChart data={chartData} />
          </div>

          <div className="grid grid-cols-2 border-t border-gray-50 pt-8">

            <div>
              <p className="text-[10px] font-black text-neutral-gray uppercase tracking-widest mb-2">
                Total Revenue Today
              </p>

              <p className="text-sm md:text-xl font-black text-accent-navy italic">
                {formatNaira(Number(todayRevenue._sum.merchandiseSubtotal || 0))}
              </p>
            </div>

            <div className="text-right">
              <p className="text-[10px] font-black text-neutral-gray uppercase tracking-widest mb-2">
                Monthly Revenue
              </p>

              <p className="text-sm md:text-xl font-black text-brand-primary italic">
               {formatNaira(Number(monthRevenue._sum.merchandiseSubtotal || 0))}
              </p>
            </div>

          </div>
        </div>
        {/* COMMISSION BREAKDOWN */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">

          <div className="flex items-center justify-between mb-8">

            <div>
              <h3 className="text-sm md:text-xl font-black text-accent-navy uppercase tracking-tight italic">
                Commission Breakdown
              </h3>

              <p className="text-[9px] font-bold text-neutral-gray uppercase tracking-widest">
                Revenue Distribution Overview
              </p>
            </div>

            <Landmark className="text-brand-primary" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">

            <div className="bg-[#FBFBFB] rounded-[2rem] p-6 border border-gray-100">

              <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-4">
                <Wallet size={20} />
              </div>

              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-gray">
                Gross Revenue
              </p>

              <h3 className="text-xl font-black italic text-accent-navy mt-2">
                {formatNaira(grossRevenue)}
              </h3>
            </div>

            <div className="bg-[#FBFBFB] rounded-[2rem] p-6 border border-gray-100">

              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
                <Percent size={20} />
              </div>

              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-gray">
                Average Commission
              </p>

              <h3 className="text-xl font-black italic text-accent-navy mt-2">
                {averageCommissionRate.toFixed(0)}%
              </h3>
            </div>

            <div className="bg-[#FBFBFB] rounded-[2rem] p-6 border border-gray-100">

              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
                <Landmark size={20} />
              </div>

              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-gray">
                Platform Earnings
              </p>

              <h3 className="text-xl font-black italic text-accent-navy mt-2">
                {formatNaira(totalPlatformCommission)}
              </h3>
            </div>

            <div className="bg-[#FBFBFB] rounded-[2rem] p-6 border border-gray-100">

              <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-4">
                <TrendingUp size={20} />
              </div>

              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-gray">
                Vendor Net Earnings
              </p>

              <h3 className="text-xl font-black italic text-brand-primary mt-2">
                {formatNaira(vendorNetEarnings)}
              </h3>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}



