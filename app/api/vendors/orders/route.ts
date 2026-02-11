import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth"; 
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 1. Get the Vendor Profile associated with the user
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!vendorProfile) {
      return NextResponse.json({ message: "Vendor profile not found" }, { status: 404 });
    }

    // 2. Fetch orders for this specific vendor
    const orders = await prisma.order.findMany({
      where: { vendorProfileId: vendorProfile.id },
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
      },
    });

    // 3. Format for the Redux state
    const formattedOrders = orders.map((order) => ({
      id: order.id,
      customerName: `${order.firstName ?? ""} ${order.lastName ?? ""}`.trim() || "Guest Customer",
      customerEmail: order.email,
      totalAmount: Number(order.total),
      status: order.status.toUpperCase(), // Syncing "pending" to "PENDING"
      createdAt: order.createdAt,
    }));

    return NextResponse.json(formattedOrders);
  } catch (error) {
    console.error("GET_VENDOR_ORDERS_ERROR:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}