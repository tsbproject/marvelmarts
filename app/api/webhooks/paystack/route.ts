// import { prisma } from "@/app/lib/prisma";
// import { NextResponse } from "next/server";
// import crypto from "crypto";
// import { addCreditsToVendor } from "@/app/_actions/boostActions";

// export async function POST(req: Request) {
//   try {
//     const body = await req.text();

//     const hash = crypto
//       .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
//       .update(body)
//       .digest("hex");

//     if (hash !== req.headers.get("x-paystack-signature")) {
//       return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
//     }

//     const event = JSON.parse(body);

//     if (event.event === "charge.success") {
//       const { reference, metadata } = event.data;

//       console.log("💰 Paystack charge success:", reference);

//       /**
//        *  PREVENT DUPLICATE PROCESSING
//        */
//       const existingTransaction = await prisma.creditTransaction.findUnique({
//         where: { reference },
//       });

//       if (existingTransaction) {
//         console.log("⚠️ Duplicate webhook ignored:", reference);
//         return NextResponse.json({ received: true });
//       }

//       /**
//        *  CASE 1: CREDIT PURCHASE
//        */
//       if (metadata?.custom_fields) {
//         const fields = metadata.custom_fields;

//         const vendorIdField = fields.find(
//           (f: any) => f.variable_name === "vendor_id"
//         );

//         const creditsField = fields.find(
//           (f: any) => f.variable_name === "credits"
//         );

//         if (vendorIdField && creditsField) {
//           const vendorProfileId = vendorIdField.value;
//           const credits = Number(creditsField.value);

//           console.log(
//             `🎯 Credit Purchase → Vendor: ${vendorProfileId}, Credits: ${credits}`
//           );

//           const result = await addCreditsToVendor(
//             vendorProfileId,
//             credits,
//             reference
//           );

//           if (!result.success) {
//             console.error("❌ Credit update failed:", result.error);
//             return NextResponse.json(
//               { error: "Credit update failed" },
//               { status: 500 }
//             );
//           }

//           console.log(" Credits successfully added");

//           return NextResponse.json({ received: true });
//         }
//       }

//       /**
//        *  CASE 2: NORMAL ORDER
//        */
//       if (metadata?.orderId) {
//         const existingOrder = await prisma.order.findUnique({
//           where: { id: metadata.orderId },
//         });

//         if (existingOrder?.paymentStatus) {
//           console.log("⚠️ Order already processed:", metadata.orderId);
//           return NextResponse.json({ received: true });
//         }

//         await prisma.order.update({
//           where: { id: metadata.orderId },
//           data: {
//             paymentStatus: true,
//             status: "processing",
//             paymentIntentId: reference,
//           },
//         });

//         console.log(`📦 Order ${metadata.orderId} verified and paid.`);
//       }
//     }

//     return NextResponse.json({ received: true });
//   } catch (error: any) {
//     console.error("❌ Webhook Error:", error.message);

//     return NextResponse.json(
//       { error: error.message },
//       { status: 500 }
//     );
//   }
// }




import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { addCreditsToVendor } from "@/app/_actions/boostActions";
import {
  sendOrderConfirmationEmail,
  sendAdminOrderNotification,
} from "@/app/lib/mailer";

export async function POST(req: Request) {
  try {
    console.log("Webhook hit");

    const body = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      console.error("Missing PAYSTACK_SECRET_KEY");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const hash = crypto
      .createHmac("sha512", secretKey)
      .update(body)
      .digest("hex");

    if (!signature || hash !== signature) {
      console.error("Invalid signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);

    if (event.event !== "charge.success") {
      return NextResponse.json({ received: true });
    }

    const { reference, metadata } = event.data || {};

    const existingTransaction = await prisma.creditTransaction.findUnique({
      where: { reference },
    });

    if (existingTransaction) {
      console.log("Duplicate webhook ignored:", reference);
      return NextResponse.json({ received: true });
    }

    if (metadata?.custom_fields) {
      const fields = metadata.custom_fields;

      const vendorIdField = fields.find(
        (f: any) => f.variable_name === "vendor_id"
      );

      const creditsField = fields.find(
        (f: any) => f.variable_name === "credits"
      );

      if (vendorIdField && creditsField) {
        const vendorProfileId = vendorIdField.value;
        const credits = Number(creditsField.value);

        const result = await addCreditsToVendor(
          vendorProfileId,
          credits,
          reference
        );

        if (!result.success) {
          console.error("Credit update failed:", result.error);
          return NextResponse.json(
            { error: result.error || "Credit update failed" },
            { status: 500 }
          );
        }

        return NextResponse.json({ received: true });
      }
    }

    if (metadata?.orderId) {
      const existingOrder = await prisma.order.findUnique({
        where: { id: metadata.orderId },
        include: {
          items: true,
          vendorProfile: {
            select: {
              storeName: true,
            },
          },
        },
      });

      if (!existingOrder) {
        console.error("Webhook order not found:", metadata.orderId);
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        );
      }

      if (
        metadata?.orderNumber &&
        metadata.orderNumber !== existingOrder.orderNumber
      ) {
        console.error("Webhook order number mismatch", {
          metadataOrderNumber: metadata.orderNumber,
          dbOrderNumber: existingOrder.orderNumber,
        });

        return NextResponse.json(
          { error: "Order number mismatch" },
          { status: 400 }
        );
      }

      if (existingOrder.paymentStatus) {
        console.log("Order already processed:", existingOrder.orderNumber);
        return NextResponse.json({ received: true });
      }

      const updatedOrder = await prisma.order.update({
        where: { id: existingOrder.id },
        data: {
          paymentStatus: true,
          status: "processing",
          paymentIntentId: reference,
        },
        include: {
          items: true,
          vendorProfile: {
            select: {
              storeName: true,
            },
          },
        },
      });

      try {
        await Promise.all([
          sendOrderConfirmationEmail(updatedOrder),
          sendAdminOrderNotification(updatedOrder),
        ]);

        if (!updatedOrder.emailSent) {
          await prisma.order.update({
            where: { id: updatedOrder.id },
            data: { emailSent: true },
          });
        }
      } catch (mailErr: any) {
        console.error("Webhook email dispatch failed:", mailErr.message);
      }

      console.log("Order updated successfully:", updatedOrder.orderNumber);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json(
      { error: error.message || "Webhook failed" },
      { status: 500 }
    );
  }
}