// app/lib/actions/orders.ts
import { prisma } from "@/app/lib/prisma";

export async function getRecentActivity() {
  try {
    const activities = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        total: true,
        firstName: true,
        lastName: true,
        paymentStatus: true,
        createdAt: true,
      }
    });
    return activities;
  } catch (error) {
    console.error("Failed to fetch activity:", error);
    return [];
  }
}