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
    const { logoUrl, coverUrl, bio, storeName } = body;

    // 1. Update the Vendor Profile branding
    const updatedProfile = await prisma.vendorProfile.update({
      where: { userId: session.user.id },
      data: {
        logoUrl,
        coverUrl,
        bio,
        storeName,
        // 2. Mark onboarding step as done
        onboarding: {
          update: {
            storeDone: true,
          }
        }
      },
    });

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error) {
    console.error("SETTINGS_UPDATE_ERROR:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}