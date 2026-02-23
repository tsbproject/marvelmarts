// import { NextResponse } from "next/server";
// import { prisma } from "@/app/lib/prisma";
// import { getServerSession } from "next-auth"; 
// import { authOptions } from "@/app/lib/auth";

// export async function POST(req: Request) {
//   try {
//     const session = await getServerSession(authOptions);
    
//     if (!session?.user?.id) {
//       return NextResponse.json({ error: "Please login to checkout" }, { status: 401 });
//     }

//     const body = await req.json();
//     const { formData, items, subtotal, shipping, total } = body;

//     if (!items || items.length === 0) {
//       return NextResponse.json({ error: "No items in cart" }, { status: 400 });
//     }

//     // 1. Resolve Vendor Relationship
//     // MarvelMarts requirement: Every order must link to a vendorProfileId.
//     // We fetch the vendorProfileId from the product associated with the first item.
//     const productData = await prisma.product.findUnique({
//       where: { id: items[0].id },
//       select: { vendorProfileId: true }
//     });

//     if (!productData?.vendorProfileId) {
//       return NextResponse.json({ error: "Vendor information missing for these products" }, { status: 400 });
//     }

//     const orderCount = await prisma.order.count();
//     const orderNumber = `MARVEL-${1000 + orderCount + 1}`;

//     // 2. Create the Order in DB
//     const order = await prisma.order.create({
//       data: {
//         orderNumber,
//         userId: session.user.id,
//         vendorProfileId: productData.vendorProfileId, // FIXED: Required field now included
//         email: formData.email,
//         firstName: formData.firstName,
//         lastName: formData.lastName,
//         streetAddress: formData.streetAddress,
//         apartment: formData.apartment || null,
//         city: formData.city,
//         state: formData.state,
//         orderNotes: formData.orderNotes || null,
//         useDifferentShipping: formData.useDifferentShipping || false,
//         shippingAddress: formData.useDifferentShipping ? formData.shippingDetails?.streetAddress : formData.streetAddress,
//         shippingCity: formData.useDifferentShipping ? formData.shippingDetails?.city : formData.city,
//         shippingState: formData.useDifferentShipping ? formData.shippingDetails?.state : formData.state,
//         subtotal: Number(subtotal),
//         shipping: Number(shipping),
//         total: Number(total),
//         status: "pending",
//         items: {
//           create: items.map((item: any) => ({
//             productId: item.id,
//             variantId: item.variantId || null,
//             qty: parseInt(item.quantity),
//             unitPrice: Number(item.price),
//             title: item.title,
//             imageUrl: item.imageUrl
//           })),
//         },
//       },
//       include: { items: true }
//     });

//     // 3. INITIALIZE PAYSTACK
//     const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         email: formData.email,
//         amount: Math.round(Number(total) * 100), // Kobo
//         metadata: {
//           orderId: order.id,
//           custom_fields: [
//             {
//               display_name: "Order Number",
//               variable_name: "order_number",
//               value: order.orderNumber
//             }
//           ]
//         },
//         callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/thank-you?orderId=${order.id}`,
//       }),
//     });

//     const paystackData = await paystackRes.json();

//     if (!paystackData.status) {
//       throw new Error(paystackData.message || "Paystack initialization failed");
//     }

//     return NextResponse.json({ 
//       orderId: order.id, 
//       url: paystackData.data.authorization_url 
//     }, { status: 201 });

//   } catch (error: any) {
//     console.error("DB_ORDER_ERROR:", error);
//     return NextResponse.json(
//       { error: error.message || "Failed to process order" }, 
//       { status: 500 }
//     );
//   }
// }

// export async function GET(req: Request) {
//   try {
//     const session = await getServerSession(authOptions);
    
//     if (!session?.user?.id) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const orders = await prisma.order.findMany({
//       where: {
//         userId: session.user.id
//       },
//       include: {
//         items: true,
//         vendorProfile: {
//           select: { storeName: true }
//         }
//       },
//       orderBy: {
//         createdAt: 'desc'
//       }
//     });

//     return NextResponse.json(orders);
//   } catch (error: any) {
//     console.error("GET_ORDERS_ERROR:", error);
//     return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
//   }
// }




import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth"; 
import { authOptions } from "@/app/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Please login to checkout" }, { status: 401 });
    }

    const body = await req.json();
    const { formData, items, subtotal, shipping, total } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 });
    }

    // 1. Resolve Vendor Relationship
    const productData = await prisma.product.findUnique({
      where: { id: items[0].id },
      select: { vendorProfileId: true }
    });

    if (!productData?.vendorProfileId) {
      return NextResponse.json({ error: "Vendor information missing for these products" }, { status: 400 });
    }

    const orderCount = await prisma.order.count();
    const orderNumber = `MARVEL-${1000 + orderCount + 1}`;

    // 2. Create the Order in DB
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        vendorProfileId: productData.vendorProfileId,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        streetAddress: formData.streetAddress,
        apartment: formData.apartment || null,
        city: formData.city,
        state: formData.state,
        orderNotes: formData.orderNotes || null,
        
        // SHIPPING LOGIC: Capturing the names that were "popping red"
        useDifferentShipping: formData.useDifferentShipping || false,
        shippingFirstName: formData.useDifferentShipping ? formData.shippingDetails?.firstName : formData.firstName,
        shippingLastName: formData.useDifferentShipping ? formData.shippingDetails?.lastName : formData.lastName,
        shippingAddress: formData.useDifferentShipping ? formData.shippingDetails?.streetAddress : formData.streetAddress,
        shippingCity: formData.useDifferentShipping ? formData.shippingDetails?.city : formData.city,
        shippingState: formData.useDifferentShipping ? formData.shippingDetails?.state : formData.state,
        
        subtotal: Number(subtotal),
        shipping: Number(shipping),
        total: Number(total),
        status: "pending",
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            variantId: item.variantId || null,
            qty: parseInt(item.quantity),
            unitPrice: Number(item.price),
            title: item.title,
            imageUrl: item.imageUrl
          })),
        },
      },
      include: { items: true }
    });

    // 3. INITIALIZE PAYSTACK
    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: formData.email,
        amount: Math.round(Number(total) * 100), // Kobo
        metadata: {
          orderId: order.id,
          custom_fields: [
            {
              display_name: "Order Number",
              variable_name: "order_number",
              value: order.orderNumber
            }
          ]
        },
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/thank-you?orderId=${order.id}`,
      }),
    });

    const paystackData = await paystackRes.json();

    if (!paystackData.status) {
      throw new Error(paystackData.message || "Paystack initialization failed");
    }

    return NextResponse.json({ 
      orderId: order.id, 
      url: paystackData.data.authorization_url 
    }, { status: 201 });

  } catch (error: any) {
    console.error("DB_ORDER_ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process order" }, 
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        items: true,
        vendorProfile: {
          select: { storeName: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error("GET_ORDERS_ERROR:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}