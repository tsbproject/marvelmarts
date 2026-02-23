import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // 1. SECURITY: Only allow Admins to run this
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden: Admin access required" }, { status: 403 });
    }

    // 2. FETCH all profiles that have an associated store
    const profiles = await prisma.vendorProfile.findMany({
      include: { store: true }
    });

    // 3. TRANSACTION: Run all updates together safely
    const syncResults = await prisma.$transaction(
      profiles.map((profile) => {
        if (!profile.store) return prisma.vendorStore.create({
            data: {
                vendorProfileId: profile.id,
                slug: profile.storeName.toLowerCase().replace(/\s+/g, '-'), // Basic slug generator
                name: profile.storeName,
                description: profile.bio,
                logo: profile.logoUrl,
                banner: profile.coverUrl,
            }
        });

        return prisma.vendorStore.update({
          where: { id: profile.store.id },
          data: {
            name: profile.storeName,
            description: profile.bio,
            logo: profile.logoUrl,
            banner: profile.coverUrl,
          },
        });
      })
    );

    return NextResponse.json({ 
      success: true,
      message: `Successfully synchronized ${syncResults.length} stores with profile data.` 
    });

  } catch (error: any) {
    console.error("ADMIN_SYNC_ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}