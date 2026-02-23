import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";



export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "VENDOR") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 1. Await the params to get the ID
    const { id } = await params; 
    
    const body = await request.json();
    const { status, trackingNumber } = body;

    // 2. Get Vendor Profile
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!vendorProfile) {
      return NextResponse.json({ message: "Vendor profile not found" }, { status: 404 });
    }

    // 3. Update Order - Ensure it belongs to this vendor
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





export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // 1. Auth & Role Guard
    if (!session || session.user.role !== "VENDOR") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = params;

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
      return new NextResponse("Order not found", { status: 404 });
    }

    // 3. Security: Ensure the vendor owns this order
    const vendorProfile = await prisma.vendorProfile.findUnique({
        where: { userId: session.user.id }
    });

    if (!vendorProfile || order.vendorProfileId !== vendorProfile.id) {
      return new NextResponse("Forbidden: Access Denied", { status: 403 });
    }

    // 4. Format for Redux/UI (Matching your Checkout structure)
    const formattedOrder = {
      ...order,
      // Total formatting for JS/Redux
      total: Number(order.total),
      subtotal: Number(order.subtotal),
      shipping: Number(order.shipping),

      // Customer Identification (Matching firstName/lastName from checkout)
      customerName: `${order.firstName || ''} ${order.lastName || ''}`.trim() || order.user?.name,
      customerEmail: order.email || order.user?.email,
      
      // Billing/Primary Address
      streetAddress: order.streetAddress,
      apartment: order.apartment,
      city: order.city,
      state: order.state,
      
      // Handle the "Different Shipping Address" logic from your checkout
      useDifferentShipping: order.useDifferentShipping,
      shippingDetails: order.useDifferentShipping ? {
        firstName: order.shippingFirstName,
        lastName: order.shippingLastName,
        streetAddress: order.shippingAddress,
        city: order.shippingCity,
        state: order.shippingState,
      } : null,

      // UI fallbacks for the Order Card
      productTitle: order.items[0]?.title || order.items[0]?.product?.title,
      productImage: order.items[0]?.imageUrl || order.items[0]?.product?.images[0]?.url,
    };

    return NextResponse.json(formattedOrder);
  } catch (error) {
    console.error("[VENDOR_ORDER_SINGLE_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}