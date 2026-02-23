import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const vendors = await prisma.vendorProfile.findMany();
    const results = [];

    for (const vendor of vendors) {
      // THE FIX: We check for BOTH the vendor's Profile ID and their User ID
      // because different parts of the system might save different IDs.
      const aggregation = await prisma.order.aggregate({
        where: {
          OR: [
            { vendorProfileId: vendor.userId },
            { vendorProfileId: vendor.id } 
          ],
          status: {
            in: ["DELIVERED", "delivered", "APPROVED", "approved"] 
          },
        },
        _sum: {
          total: true,
        },
      });

      const totalSum = aggregation._sum.total ? Number(aggregation._sum.total) : 0;

      await prisma.vendorProfile.update({
        where: { id: vendor.id },
        data: {
          balance: new Prisma.Decimal(totalSum),
          lastSyncedAt: new Date(), 
        },
      });

      results.push({
        store: vendor.storeName || "Unknown",
        calculatedBalance: totalSum,
      });
    }

    return NextResponse.json({ 
      success: true, 
      syncedCount: vendors.length,
      details: results 
    });

  } catch (error: any) {
    console.error("SYNC ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error", message: error.message }, { status: 500 });
  }
}