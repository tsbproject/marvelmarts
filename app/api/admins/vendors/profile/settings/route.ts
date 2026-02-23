import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { 
      logoUrl, 
      coverUrl, 
      bio, 
      storeName, 
      instagram, 
      whatsapp, 
      twitter, 
      bankName, 
      accountNumber, 
      accountName 
    } = body;

    // Update Vendor Profile with Branding, Socials, and Payouts
    const updatedProfile = await prisma.vendorProfile.update({
      where: { userId: session.user.id },
      data: {
        logoUrl,
        coverUrl,
        bio,
        storeName,
        instagram,
        whatsapp,
        twitter,
        bankName,
        accountNumber,
        accountName,
        // Update onboarding status if essential branding is provided
        onboarding: {
          update: {
            storeDone: !!(logoUrl && coverUrl && bio),
          }
        }
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Profile settings updated", 
      profile: updatedProfile 
    });
  } catch (error) {
    console.error("VENDOR_SETTINGS_PATCH_ERROR:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}