



import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth"; 
import prisma from "@/app/lib/prisma";

// Set to 0 to ensure vendors always see real-time updates
export const revalidate = 0;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch vendor profile and all related order details
    const vendorData = await prisma.vendorProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        orders: {
          orderBy: { createdAt: "desc" },
          include: {
            items: { take: 1 },
            user: { select: { name: true, image: true, email: true } }
          }
        }
      }
    });

    if (!vendorData) {
      return NextResponse.json({ message: "Vendor profile not found" }, { status: 404 });
    }

    // 2. Map and Format the orders
    const formattedOrders = vendorData.orders.map((order: any) => {
      const firstItem = order.items[0];
      
      const checkoutName = `${order.firstName ?? ""} ${order.lastName ?? ""}`.trim();
      const accountName = order.user?.name;
      const emailFallback = order.email?.split('@')[0] || order.user?.email?.split('@')[0];
      
      const customerDisplayName = checkoutName || accountName || emailFallback || "Guest Customer";

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: customerDisplayName,
        customerEmail: order.email || order.user?.email,
        customerPhone: order.phone,
        
        streetAddress: order.streetAddress,
        apartment: order.apartment,
        city: order.city,
        state: order.state,
        orderNotes: order.orderNotes,

        useDifferentShipping: order.useDifferentShipping,
        shippingRecipient: `${order.shippingFirstName ?? ""} ${order.shippingLastName ?? ""}`.trim(),
        shippingAddress: order.shippingAddress,
        shippingCity: order.shippingCity,
        shippingState: order.shippingState,

        total: Number(order.total),
        subtotal: Number(order.subtotal),
        shipping: Number(order.shipping),
        
        status: order.status.toUpperCase(), // Matches frontend status filters
        createdAt: order.createdAt,
        
        productTitle: firstItem?.title || "MarvelMarts Order",
        productImage: firstItem?.imageUrl || null,
        trackingNumber: order.trackingNumber,
        
        userImage: order.user?.image || null
      };
    });

    /**
     * SUCCESS FIX: Wrapping the array in an object 
     * This matches your Redux slice: "return response.data.orders"
     */
    return NextResponse.json({ 
      orders: formattedOrders,
      balance: Number(vendorData.balance || 0), 
      lastSyncedAt: vendorData.lastSyncedAt || null 
    });

  } catch (error) {
    console.error("GET_VENDOR_ORDERS_ERROR:", error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}