// import { prisma } from "@/app/lib/prisma";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/lib/auth";
// import { NextResponse } from "next/server";

// export async function GET(
//   req: Request,
//   { params }: { params: { vendorProfileId: string } }
// ) {
//   try {
//     const session = await getServerSession(authOptions);

//     // Security Check: Only Admins can access vendor details via this route
//     if (!session?.user || (session.user as any).role !== "ADMIN" && (session.user as any).role !== "SUPER_ADMIN") {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const { vendorProfileId } = params;

//     const vendor = await prisma.vendorProfile.findUnique({
//       where: { id: vendorProfileId },
//       include: {
//         _count: {
//           select: { products: true }
//         },
//         // Include specific profile fields if they are in a separate model
//         // vendorProfile: true, 
//       },
//     });

//     if (!vendor) {
//       return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
//     }

//     return NextResponse.json(vendor);
//   } catch (error) {
//     console.error("VENDOR_FETCH_ERROR:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }



import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET: Fetch vendor profile details for Admin view
 * Complies with Next.js 15 async params requirement
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ vendorProfileId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    // 1. Await the params promise
    const { vendorProfileId } = await context.params;

    // 2. Security Check: Admin or Super Admin only
    const userRole = (session?.user as any)?.role;
    if (!session?.user || (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3. Database Query
    // Using vendorProfileId and vendorProfile model as requested
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: { id: vendorProfileId },
      include: {
        // Including the base user/vendor data if needed
        user: {
          select: {
            name: true,
            email: true,
          }
        },
        _count: {
          select: { products: true }
        },
      },
    });

    if (!vendorProfile) {
      return NextResponse.json({ error: "Vendor profile not found" }, { status: 404 });
    }

    return NextResponse.json(vendorProfile);
  } catch (error: any) {
    console.error("VENDOR_FETCH_ERROR:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message }, 
      { status: 500 }
    );
  }
}