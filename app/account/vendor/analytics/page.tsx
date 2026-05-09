import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import DashboardHeader from "@/app/_components/DashboardHeader";
import {
  TrendingUp,
  ArrowLeft,
  ShieldCheck,
  ShoppingBag,
  Package,
  Rocket,
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

export default async function VendorAnalyticsPage() {
  const session = await getServerSession(authOptions);

  const allowedRoles = ["VENDOR", "ADMIN", "SUPER_ADMIN"];

  if (!session?.user || !allowedRoles.includes(session.user.role as string)) {
    redirect("/auth/sign-in");
  }

  const vendorData = await prisma.vendorProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      score: true,
      boost: true,
      products: {
        include: { images: true },
      },
    },
  });

  if (!vendorData) {
    redirect("/auth/register/vendor-registration");
  }

  const today = startOfDay(new Date());
  const monthStart = startOfMonth(new Date());
  const thirtyDaysAgo = subDays(today, 30);

  const revenueStatuses = ["DELIVERED"];

  const [
    todayRevenue,
    monthRevenue,
    rawRevenueData,
    liveProductsCount,
    deliveredOrdersCount,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: {
        vendorProfileId: vendorData.id,
        status: { in: revenueStatuses },
        createdAt: { gte: today },
      },
      _sum: { total: true },
    }),

    prisma.order.aggregate({
      where: {
        vendorProfileId: vendorData.id,
        status: { in: revenueStatuses },
        createdAt: { gte: monthStart },
      },
      _sum: { total: true },
    }),

    prisma.order.findMany({
      where: {
        vendorProfileId: vendorData.id,
        status: { in: revenueStatuses },
        createdAt: { gte: thirtyDaysAgo },
      },
      select: {
        total: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    }),

    prisma.product.count({
      where: {
        vendorProfileId: vendorData.id,
        isPublished: true,
      },
    }),

    prisma.order.count({
      where: {
        vendorProfileId: vendorData.id,
        status: "DELIVERED",
      },
    }),
  ]);

  const dailyDataMap: Record<string, number> = {};

  for (let i = 0; i < 30; i++) {
    dailyDataMap[format(subDays(today, i), "MMM dd")] = 0;
  }

  rawRevenueData.forEach((order) => {
    const dateStr = format(order.createdAt, "MMM dd");

    if (dailyDataMap[dateStr] !== undefined) {
      dailyDataMap[dateStr] += Number(order.total || 0);
    }
  });

  const chartData = Object.entries(dailyDataMap)
    .map(([date, amount]) => ({
      date,
      amount,
    }))
    .reverse();

  const insightStats = {
    rating: vendorData.score?.rating || 0,
    totalSales: vendorData.products.reduce(
      (acc, p) => acc + (p.salesCount || 0),
      0
    ),
    fulfillmentRate: vendorData.score?.fulfillmentRate || 100,
    reviewsCount: vendorData.score?.reviewsCount || 0,
  };

  const analyticsCards = [
    {
      label: "Today Revenue",
      value: formatNaira(Number(todayRevenue._sum.total || 0)),
      icon: <TrendingUp size={20} />,
      color: "bg-green-50 text-green-600",
    },

    {
      label: "Monthly Revenue",
      value: formatNaira(Number(monthRevenue._sum.total || 0)),
      icon: <TrendingUp size={20} />,
      color: "bg-brand-primary/10 text-brand-primary",
    },

    {
      label: "Live Products",
      value: liveProductsCount,
      icon: <Package size={20} />,
      color: "bg-blue-50 text-blue-600",
    },

    {
      label: "Delivered Orders",
      value: deliveredOrdersCount,
      icon: <ShoppingBag size={20} />,
      color: "bg-purple-50 text-purple-600",
    },

    {
      label: "Vendor Tier",
      value: vendorData.score?.tier || "BRONZE",
      icon: <ShieldCheck size={20} />,
      color: "bg-orange-50 text-orange-600",
    },

    {
      label: "Boost Credits",
      value: vendorData.boost?.credits ?? 0,
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

        {/* TOP HEADER */}
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

        {/* INSIGHTS */}
        <div className="animate-in fade-in slide-in-from-top-4 duration-700">
          <VendorInsights stats={insightStats} />
        </div>

        {/* GRAPH */}
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
                {formatNaira(Number(todayRevenue._sum.total || 0))}
              </p>
            </div>

            <div className="text-right">
              <p className="text-[10px] font-black text-neutral-gray uppercase tracking-widest mb-2">
                Monthly Revenue
              </p>

              <p className="text-sm md:text-xl font-black text-brand-primary italic">
                {formatNaira(Number(monthRevenue._sum.total || 0))}
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}