import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

function generateOrderNumber() {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `MARVEL-${year}-${random}`;
}

async function generateUniqueOrderNumber() {
  let orderNumber = generateOrderNumber();
  let exists = await prisma.order.findUnique({
    where: { orderNumber },
    select: { id: true },
  });

  while (exists) {
    orderNumber = generateOrderNumber();
    exists = await prisma.order.findUnique({
      where: { orderNumber },
      select: { id: true },
    });
  }

  return orderNumber;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Please login to checkout" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { formData, items, subtotal, shipping, total } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "No items in cart" },
        { status: 400 }
      );
    }

    const productData = await prisma.product.findUnique({
      where: { id: items[0].id },
      select: { vendorProfileId: true },
    });

    if (!productData?.vendorProfileId) {
      return NextResponse.json(
        { error: "Vendor information missing for these products" },
        { status: 400 }
      );
    }

    const orderNumber = await generateUniqueOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        vendorProfileId: productData.vendorProfileId,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || null,
        streetAddress: formData.streetAddress,
        apartment: formData.apartment || null,
        city: formData.city,
        state: formData.state,
        orderNotes: formData.orderNotes || null,

        useDifferentShipping: !!formData.useDifferentShipping,
        shippingFirstName: formData.useDifferentShipping
          ? formData.shippingDetails?.firstName || null
          : formData.firstName,
        shippingLastName: formData.useDifferentShipping
          ? formData.shippingDetails?.lastName || null
          : formData.lastName,
        shippingAddress: formData.useDifferentShipping
          ? formData.shippingDetails?.streetAddress || null
          : formData.streetAddress,
        shippingCity: formData.useDifferentShipping
          ? formData.shippingDetails?.city || null
          : formData.city,
        shippingState: formData.useDifferentShipping
          ? formData.shippingDetails?.state || null
          : formData.state,

        subtotal: Number(subtotal),
        shipping: Number(shipping),
        total: Number(total),
        status: "pending",
        paymentStatus: false,

        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            variantId: item.variantId || null,
            qty: Number(item.quantity),
            unitPrice: Number(item.price),
            title: item.title,
            imageUrl: item.imageUrl || null,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    const paystackRes = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          amount: Math.round(Number(total) * 100),
          metadata: {
            orderId: order.id,
            orderNumber: order.orderNumber,
            custom_fields: [
              {
                display_name: "Order Number",
                variable_name: "order_number",
                value: order.orderNumber,
              },
            ],
          },
          callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/thank-you?orderNumber=${order.orderNumber}`,
        }),
      }
    );

    const paystackData = await paystackRes.json();

    if (!paystackRes.ok || !paystackData.status) {
      throw new Error(paystackData.message || "Paystack initialization failed");
    }

    return NextResponse.json(
      {
        orderId: order.id,
        orderNumber: order.orderNumber,
        url: paystackData.data.authorization_url,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("DB_ORDER_ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process order" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        items: true,
        vendorProfile: {
          select: {
            storeName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error("GET_ORDERS_ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}