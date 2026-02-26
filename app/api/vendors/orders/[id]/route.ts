import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

/**
 * PATCH: Update Order Status (Vendor Only)
 * Compliant with Next.js 15 async params
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } 
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await context.params; // 1. Await the promise
    
    // Security Guard
    if (!session || (session.user as any).role !== "VENDOR") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { status, trackingNumber } = body;

    // 2. Get Vendor Profile using userId
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: (session.user as any).id },
    });

    if (!vendorProfile) {
      return NextResponse.json({ message: "Vendor profile not found" }, { status: 404 });
    }

    // 3. Update Order - Ensure it belongs to this vendor via vendorProfileId
    const updatedOrder = await prisma.order.update({
      where: { 
        id: id,
        vendorProfileId: vendorProfile.id 
      },
      data: {
        status: status.toLowerCase(),
        trackingNumber: trackingNumber || null,
      },
    });

    return NextResponse.json({ message: "Order updated successfully", order: updatedOrder });

  } catch (error: any) {
    console.error("Order Update Error:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" }, 
      { status: 500 }
    );
  }
}

/**
 * GET: Fetch Single Order with formatted details for Redux
 * Compliant with Next.js 15 async params
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await context.params; // 1. Await the promise

    // Auth & Role Guard
    if (!session || (session.user as any).role !== "VENDOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch Order with Relations
    const order = await prisma.order.findUnique({
      where: { id: id },
      include: {
        user: {
          select: { name: true, email: true, image: true },
        },
        items: { 
          include: {
            product: {
              select: {
                title: true,
                images: { take: 1, select: { url: true } }
              }
            }
          }
        }
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 3. Security Check: Vendor must own the profile associated with this order
    const vendorProfile = await prisma.vendorProfile.findUnique({
        where: { userId: (session.user as any).id }
    });

    if (!vendorProfile || order.vendorProfileId !== vendorProfile.id) {
      return NextResponse.json({ error: "Forbidden: Access Denied" }, { status: 403 });
    }

    // 4. Format for Redux/UI (Consistent with Checkout structure)
    const formattedOrder = {
      ...order,
      total: Number(order.total),
      subtotal: Number(order.subtotal),
      shipping: Number(order.shipping),

      // Customer Identification
      customerName: `${order.firstName || ''} ${order.lastName || ''}`.trim() || order.user?.name,
      customerEmail: order.email || order.user?.email,
      
      // Handle "Different Shipping Address" logic
      useDifferentShipping: order.useDifferentShipping,
      shippingDetails: order.useDifferentShipping ? {
        firstName: order.shippingFirstName,
        lastName: order.shippingLastName,
        streetAddress: order.shippingAddress,
        city: order.shippingCity,
        state: order.shippingState,
      } : null,

      // UI fallbacks for display
      productTitle: order.items[0]?.title || order.items[0]?.product?.title,
      productImage: order.items[0]?.imageUrl || order.items[0]?.product?.images[0]?.url,
    };

    return NextResponse.json(formattedOrder);
  } catch (error: any) {
    console.error("[VENDOR_ORDER_SINGLE_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}