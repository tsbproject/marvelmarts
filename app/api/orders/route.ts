

// import { NextResponse } from "next/server";
// import { prisma } from "@/app/lib/prisma";
// import { getServerSession } from "next-auth"; 
// import { authOptions } from "@/app/lib/auth";

// export async function POST(req: Request) {
//   try {
//     const session = await getServerSession(authOptions);
    
//     // 1. Auth Guard
//     if (!session?.user?.id) {
//       return NextResponse.json({ error: "Please login to checkout" }, { status: 401 });
//     }

//     const body = await req.json();
//     const { formData, items, subtotal, shipping, total } = body;

//     // 2. Validation Guard
//     if (!items || items.length === 0) {
//       return NextResponse.json({ error: "No items in cart" }, { status: 400 });
//     }

//     // 3. Generate Secure Order Number
//     // Tip: Using a random suffix or Date.now() prevents "Order Number Scraping"
//     const orderCount = await prisma.order.count();
//     const orderNumber = `MARVEL-${1000 + orderCount + 1}`;

//     // 4. Database Transaction
//     const order = await prisma.order.create({
//       data: {
//         orderNumber,
//         userId: session.user.id,
//         email: formData.email,
//         firstName: formData.firstName,
//         lastName: formData.lastName,
//         streetAddress: formData.streetAddress,
//         apartment: formData.apartment,
//         city: formData.city,
//         state: formData.state,
//         orderNotes: formData.orderNotes,
//         useDifferentShipping: formData.useDifferentShipping,
        
//         // Handling shipping details conditionally with fallback
//         shippingAddress: formData.useDifferentShipping ? formData.shippingDetails?.streetAddress : formData.streetAddress,
//         shippingCity: formData.useDifferentShipping ? formData.shippingDetails?.city : formData.city,
//         shippingState: formData.useDifferentShipping ? formData.shippingDetails?.state : formData.state,
        
//         // Explicitly ensuring Decimal compatibility
//         subtotal: Number(subtotal),
//         shipping: Number(shipping),
//         total: Number(total),
        
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
//       include: {
//         items: true
//       }
//     });

//     // 5. Success Response
//     // We return the orderId so the frontend can pass it to Paystack/Verify
//     return NextResponse.json({ 
//       orderId: order.id, 
//       orderNumber: order.orderNumber,
//       total: order.total 
//     }, { status: 201 });

//   } catch (error: any) {
//     console.error("DB_ORDER_ERROR:", error);
//     return NextResponse.json(
//       { error: error.message || "Failed to save order" }, 
//       { status: 500 }
//     );
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

    const orderCount = await prisma.order.count();
    const orderNumber = `MARVEL-${1000 + orderCount + 1}`;

    // 1. Create the Order in DB
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session.user.id,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        streetAddress: formData.streetAddress,
        apartment: formData.apartment,
        city: formData.city,
        state: formData.state,
        orderNotes: formData.orderNotes,
        useDifferentShipping: formData.useDifferentShipping,
        shippingAddress: formData.useDifferentShipping ? formData.shippingDetails?.streetAddress : formData.streetAddress,
        shippingCity: formData.useDifferentShipping ? formData.shippingDetails?.city : formData.city,
        shippingState: formData.useDifferentShipping ? formData.shippingDetails?.state : formData.state,
        subtotal: Number(subtotal),
        shipping: Number(shipping),
        total: Number(total),
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

    // 2. INITIALIZE PAYSTACK
    // We do this AFTER the order is created so we have the 'order.id' for metadata
    const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: formData.email,
        amount: Math.round(Number(total) * 100), // Amount in Kobo (Naira * 100)
        metadata: {
          orderId: order.id, // This is the 'secret sauce' for the webhook
          custom_fields: [
            {
              display_name: "Order Number",
              variable_name: "order_number",
              value: order.orderNumber
            }
          ]
        },
        // Replace with your actual frontend URLs
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/thank-you?orderId=${order.id}`,
      }),
    });

    const paystackData = await paystackRes.json();

    if (!paystackData.status) {
      throw new Error(paystackData.message || "Paystack initialization failed");
    }

    // 3. Return the authorization_url to the frontend
    return NextResponse.json({ 
      orderId: order.id, 
      url: paystackData.data.authorization_url // Frontend will redirect to this
    }, { status: 201 });

  } catch (error: any) {
    console.error("DB_ORDER_ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process order" }, 
      { status: 500 }
    );
  }
}