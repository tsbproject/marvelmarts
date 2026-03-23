


// import { prisma } from "@/app/lib/prisma";
// import { NextResponse } from "next/server";
// import { Resend } from "resend";
// import OrderConfirmationEmail from "@/app/_emails/OrderConfirmationEmail";

// const resend = new Resend(process.env.RESEND_API_KEY);

// export async function GET(
//   req: Request,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const { id } = await params;
//     const orderNumber = id;

//     const order = await prisma.order.findUnique({
//       where: { orderNumber },
//       include: {
//         items: true,
//         vendorProfile: {
//           select: {
//             storeName: true,
//           },
//         },
//       },
//     });

//     if (!order) {
//       return NextResponse.json({ error: "Order not found" }, { status: 404 });
//     }

//     if (order.paymentStatus === true && !order.emailSent) {
//       if (!order.email) {
//         console.error("Order email is missing or null, cannot send confirmation.");
//       } else {
//         try {
//           await resend.emails.send({
//             from: "MarvelMarts <orders@tayobolarinwa.dev>",
//             to: order.email,
//             subject: `Your MarvelMarts Order #${order.orderNumber} is Confirmed!`,
//             react: OrderConfirmationEmail({ order }),
//           });

//           await prisma.order.update({
//             where: { id: order.id },
//             data: { emailSent: true },
//           });

//           console.log(`Email sent successfully to ${order.email}`);
//         } catch (emailErr: any) {
//           console.error("Resend Error:", emailErr.message);
//         }
//       }
//     }

//     return NextResponse.json({
//       paid: order.paymentStatus,
//       status: order.status,
//       orderNumber: order.orderNumber,
//     });
//   } catch (error: any) {
//     console.error("Route Error:", error.message);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }



import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderNumber = id;

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      select: {
        paymentStatus: true,
        status: true,
        orderNumber: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      paid: order.paymentStatus,
      status: order.status,
      orderNumber: order.orderNumber,
    });
  } catch (error: any) {
    console.error("VERIFY_STATUS_ERROR:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}