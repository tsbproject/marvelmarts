// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/lib/auth";
// import { prisma } from "@/app/lib/prisma";

// export async function POST(req: Request) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.id) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//     }

//     const body = await req.json();
//     const { amount } = body;

//     // 1. Basic validation
//     if (!amount || amount <= 0) {
//       return NextResponse.json({ message: "Invalid amount" }, { status: 400 });
//     }

//     // 2. Run as a Transaction to prevent money glitches
//     const result = await prisma.$transaction(async (tx) => {
//       // Find the vendor profile and get the latest saved bank details
//       const profile = await tx.vendorProfile.findUnique({
//         where: { userId: session.user.id },
//       });

//       if (!profile) throw new Error("Vendor profile not found");

//       // MANDATORY CHECK: Ensure they have saved bank details in their settings
//       if (!profile.bankName || !profile.accountNumber || !profile.accountName) {
//         throw new Error("Please complete your Payout Details in Settings before requesting a withdrawal.");
//       }

//       if (profile.balance < amount) throw new Error("Insufficient balance");

//       // 3. Create the Payout - PULLING bank details directly from Profile for 100% accuracy
//       const payout = await tx.payout.create({
//         data: {
//           amount,
//           status: "PENDING",
//           bankName: profile.bankName,      // Verified from DB, not from frontend body
//           accountNumber: profile.accountNumber,
//           accountName: profile.accountName,
//           vendorProfile: {
//             connect: { id: profile.id }
//           },
//           vendor: {
//             connect: { id: session.user.id }
//           },
//         },
//       });

//       // 4. Deduct the amount from vendor's balance immediately
//       const updatedProfile = await tx.vendorProfile.update({
//         where: { id: profile.id },
//         data: {
//           balance: { decrement: amount },
//         },
//       });

//       return { payout, newBalance: updatedProfile.balance };
//     });

//     return NextResponse.json({
//       message: "Payout request submitted successfully",
//       payout: result.payout,
//       newBalance: result.newBalance,
//     });

//   } catch (error: any) {
//     console.error("PAYOUT_ERROR:", error);
//     return NextResponse.json(
//       { message: error.message || "Something went wrong" },
//       { status: 500 }
//     );
//   }
// }


// export async function GET() {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

//     const payouts = await prisma.payout.findMany({
//       where: { vendorId: session.user.id },
//       orderBy: { createdAt: "desc" },
//     });

//     return NextResponse.json({ payouts });
//   } catch (error: any) {
//     return NextResponse.json({ message: error.message }, { status: 500 });
//   }
// }





import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const amount = Number(body.amount);

    if (!amount || amount <= 0) {
      return NextResponse.json({ message: "Invalid amount" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const profile = await tx.vendorProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (!profile) {
        return { error: "Vendor profile not found", status: 404 as const };
      }

      if (!profile.bankName || !profile.accountNumber || !profile.accountName) {
        return {
          error: "Please complete your Payout Details in Settings before requesting a withdrawal.",
          status: 400 as const,
        };
      }

      const currentBalance = Number(profile.balance || 0);

      if (currentBalance < amount) {
        return { error: "Insufficient balance", status: 400 as const };
      }

      const payout = await tx.payout.create({
        data: {
          amount,
          status: "PENDING",
          bankName: profile.bankName,
          accountNumber: profile.accountNumber,
          accountName: profile.accountName,
          vendorId: session.user.id,
          vendorProfileId: profile.id,
          reference: `PAYOUT-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
        },
      });
      const updatedProfile = await tx.vendorProfile.update({
        where: { id: profile.id },
        data: {
          balance: {
            decrement: amount,
          },
        },
      });

      return {
        payout,
        newBalance: Number(updatedProfile.balance || 0),
      };
    });

    if ("error" in result) {
      return NextResponse.json({ message: result.error }, { status: result.status });
    }

    return NextResponse.json({
      message: "Payout request submitted successfully",
      payout: result.payout,
      newBalance: result.newBalance,
    });
  } catch (error: any) {
    console.error("PAYOUT_ERROR:", error);
    return NextResponse.json(
      { message: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const payouts = await prisma.payout.findMany({
      where: { vendorId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ payouts });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}