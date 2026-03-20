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

export async function POST(req: Request) {
  try {
    console.log("Webhook hit");

    const body = await req.text();
    console.log("Webhook body received");

    const signature = req.headers.get("x-paystack-signature");
    console.log("Signature present:", !!signature);

    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest("hex");

    if (hash !== signature) {
      console.error("Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    console.log("Signature verified");

    const event = JSON.parse(body);
    console.log("Event:", event.event);

    if (event.event === "charge.success") {
      const { reference, metadata } = event.data;

      console.log("Charge success reference:", reference);
      console.log("Metadata:", JSON.stringify(metadata, null, 2));

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

        console.log("vendorIdField:", vendorIdField);
        console.log("creditsField:", creditsField);

        if (vendorIdField && creditsField) {
          const vendorProfileId = vendorIdField.value;
          const credits = Number(creditsField.value);

          console.log("Calling addCreditsToVendor with:", {
            vendorProfileId,
            credits,
            reference,
          });

          const result = await addCreditsToVendor(
            vendorProfileId,
            credits,
            reference
          );

          console.log("addCreditsToVendor result:", result);

          if (!result.success) {
            console.error("Credit update failed:", result.error);
            return NextResponse.json(
              { error: result.error || "Credit update failed" },
              { status: 500 }
            );
          }

          console.log("Credits successfully added");
          return NextResponse.json({ received: true });
        }

        console.log("Credit metadata fields not found");
      }

      if (metadata?.orderId) {
        console.log("Processing order:", metadata.orderId);

        const existingOrder = await prisma.order.findUnique({
          where: { id: metadata.orderId },
        });

        if (existingOrder?.paymentStatus) {
          console.log("Order already processed:", metadata.orderId);
          return NextResponse.json({ received: true });
        }

        await prisma.order.update({
          where: { id: metadata.orderId },
          data: {
            paymentStatus: true,
            status: "processing",
            paymentIntentId: reference,
          },
        });

        console.log("Order updated successfully");
      }
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