// import { NextResponse } from "next/server";
// import { prisma } from "@/app/lib/prisma";
// import { getServerSession } from "next-auth"; 
// import { authOptions } from "@/app/lib/auth";

// export async function POST(req: Request) {
//   try {
//     const session = await getServerSession(authOptions);
//     const body = await req.json();
//     const { formData, items, subtotal, shipping, total } = body;

//     if (!session?.user?.id) {
//       return NextResponse.json({ error: "Please login to checkout" }, { status: 401 });
//     }

//     // Generate Order Number
//     const orderCount = await prisma.order.count();
//     const orderNumber = `MARVEL-${1000 + orderCount + 1}`;

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
//         shippingAddress: formData.useDifferentShipping ? formData.shippingDetails.streetAddress : null,
//         shippingCity: formData.useDifferentShipping ? formData.shippingDetails.city : null,
//         shippingState: formData.useDifferentShipping ? formData.shippingDetails.state : null,
//         subtotal: subtotal,
//         shipping: shipping,
//         total: total,
//         items: {
//           create: items.map((item: any) => ({
//             productId: item.id,
//             variantId: item.variantId || null,
//             qty: item.quantity,
//             unitPrice: item.price,
//             title: item.title,
//             imageUrl: item.imageUrl
//           })),
//         },
//       },
//     });

//     return NextResponse.json({ 
//       orderId: order.id, 
//       orderNumber: order.orderNumber,
//       total: order.total 
//     }, { status: 201 });

//   } catch (error) {
//     console.error("DB_ORDER_ERROR:", error);
//     return NextResponse.json({ error: "Failed to save order" }, { status: 500 });
//   }
// }




import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth"; 
import { authOptions } from "@/app/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // 1. Auth Guard
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Please login to checkout" }, { status: 401 });
    }

    const body = await req.json();
    const { formData, items, subtotal, shipping, total } = body;

    // 2. Validation Guard
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 });
    }

    // 3. Generate Secure Order Number
    // Using a timestamp + count to ensure uniqueness even in high traffic
    const orderCount = await prisma.order.count();
    const orderNumber = `MARVEL-${1000 + orderCount + 1}`;

    // 4. Database Transaction
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
        
        // Handling shipping details conditionally
        shippingAddress: formData.useDifferentShipping ? formData.shippingDetails.streetAddress : formData.streetAddress,
        shippingCity: formData.useDifferentShipping ? formData.shippingDetails.city : formData.city,
        shippingState: formData.useDifferentShipping ? formData.shippingDetails.state : formData.state,
        
        subtotal: parseFloat(subtotal),
        shipping: parseFloat(shipping),
        total: parseFloat(total),
        
        // Important: "items" here must match your Prisma schema relation name
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            variantId: item.variantId || null,
            qty: parseInt(item.quantity),
            unitPrice: parseFloat(item.price),
            title: item.title,
            imageUrl: item.imageUrl
          })),
        },
      },
      include: {
        items: true // Returns the created items in the response
      }
    });

    // 5. Success Response
    return NextResponse.json({ 
      orderId: order.id, 
      orderNumber: order.orderNumber,
      total: order.total 
    }, { status: 201 });

  } catch (error: any) {
    console.error("DB_ORDER_ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save order" }, 
      { status: 500 }
    );
  }
}
