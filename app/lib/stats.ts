import { prisma } from "@/app/lib/prisma";
import { startOfDay, subDays } from "date-fns";

export async function getVendorRevenueStats(vendorProfileId: string) {
  const sevenDaysAgo = subDays(startOfDay(new Date()), 6);

  const orders = await prisma.order.findMany({
    where: {
      vendorProfileId,
      status: "approved", // Only count money from approved orders
      createdAt: { gte: sevenDaysAgo },
    },
    select: {
      total: true,
      createdAt: true,
    },
  });

  // Calculate Today's and Monthly totals
  const today = startOfDay(new Date());
  const firstOfOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const [todayEarnings, monthEarnings] = await Promise.all([
    prisma.order.aggregate({
      where: { vendorProfileId, status: "approved", createdAt: { gte: today } },
      _sum: { total: true }
    }),
    prisma.order.aggregate({
      where: { vendorProfileId, status: "approved", createdAt: { gte: firstOfOfMonth } },
      _sum: { total: true }
    })
  ]);

  return {
    today: Number(todayEarnings._sum.total || 0),
    month: Number(monthEarnings._sum.total || 0),
    // You can pass this 'orders' array to a Chart.js or Recharts component later
    chartData: orders 
  };
}