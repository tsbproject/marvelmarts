// import { NextResponse } from "next/server";
// import { prisma } from "@/app/lib/prisma";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/lib/auth";
// import { UserRole } from "@prisma/client";

// export const dynamic = "force-dynamic";

// export async function GET() {
//   try {
//     // Security check for ADIMNS
//     const session = await getServerSession(authOptions);
//     if (!session || session.user.role !== UserRole.ADMIN) {
//       return NextResponse.json({ error: "Access denied" }, { status: 403 });
//     }

//     const vendors = await prisma.vendorProfile.findMany({
//       include: {
//         user: {
//           select: {
//             name: true,
//             email: true,
//           },
//         },
//       },
//       orderBy: { createdAt: "desc" },
//     });

//     return NextResponse.json({ success: true, vendors });
//   } catch (error: any) {
//     return NextResponse.json({ error: "Failed to fetch vendors" }, { status: 500 });
//   }
// }



import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { UserRole } from "@prisma/client";

export const dynamic = "force-dynamic";

// 1. GET: Fetch vendors (Admin Only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const vendors = await prisma.vendorProfile.findMany({
      include: {
        user: { select: { name: true, email: true } },
        onboarding: true, // Crucial for tracking progress
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, vendors });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch vendors" }, { status: 500 });
  }
}

// 2. PATCH: Update Store Setup (Vendor Only)
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { storeName, storePhone, storeAddress, logoUrl, coverUrl } = body;

    // Use a transaction to ensure both Profile and Onboarding update together
    const result = await prisma.$transaction(async (tx) => {
      // Update the vendor profile
      const updatedProfile = await tx.vendorProfile.update({
        where: { userId: session.user.id },
        data: {
          storeName,
          storePhone,
          storeAddress,
          logoUrl,
          coverUrl,
        },
      });

      // Mark the 'Store Identity' step as completed
      await tx.vendorOnboarding.update({
        where: { vendorProfileId: updatedProfile.id },
        data: { storeDone: true },
      });

      return updatedProfile;
    });

    return NextResponse.json({ success: true, vendor: result });
  } catch (error: any) {
    console.error("STORE_UPDATE_ERROR:", error);
    return NextResponse.json({ error: "Failed to update store setup" }, { status: 500 });
  }
}