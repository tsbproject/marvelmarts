// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/app/lib/prisma";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/lib/auth";

// export async function POST(req: NextRequest) {
//   const session = await getServerSession(authOptions);

//   if (!session?.user) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   try {
//     const { reference } = await req.json();

//     // 1. Verify with Paystack
//     const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
//       headers: {
//         Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//       },
//     });

//     const resData = await response.json();

//     if (!resData.status || resData.data.status !== "success") {
//       return NextResponse.json({ error: "Verification failed" }, { status: 400 });
//     }

//     const auth = resData.data.authorization;

//     // 2. Save to database
//     const paymentMethod = await prisma.paymentMethod.create({
//       data: {
//         userId: session.user.id,
//         provider: "PAYSTACK",
//         providerId: auth.authorization_code,
//         last4: auth.last4,
//         expiryMonth: auth.exp_month,
//         expiryYear: auth.exp_year.toString().slice(-2),
//         cardType: auth.brand,
//         isDefault: true, // Simplified for this example
//       },
//     });

//     return NextResponse.json({ success: true, data: paymentMethod });
//   } catch (error) {
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }




import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { reference } = body;

    if (!reference) {
      return NextResponse.json({ error: "No reference provided" }, { status: 400 });
    }

    // 1. Verify with Paystack
    const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    const resData = await paystackRes.json();

    // LOG THIS: This is where you'll see the real reason for the 400
    console.log("Paystack Verification Response:", resData);

    if (!resData.status || resData.data.status !== "success") {
      return NextResponse.json({ 
        error: resData.message || "Paystack verification failed" 
      }, { status: 400 });
    }

    const auth = resData.data.authorization;

    // 2. Save to database using your exact model fields
    const newCard = await prisma.paymentMethod.create({
      data: {
        userId: session.user.id,
        provider: "PAYSTACK",
        providerId: auth.authorization_code, // Store the reusable token
        cardType: auth.brand,
        last4: auth.last4,
        expiryMonth: auth.exp_month,
        expiryYear: auth.exp_year.toString().slice(-2),
        isDefault: true, // You can add logic to check if it's the first card
        metadata: resData.data,
      },
    });

    return NextResponse.json({ success: true, data: newCard });

  } catch (error: any) {
    console.error("API_PAYMENT_ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}