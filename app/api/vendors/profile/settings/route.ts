import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";



export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();

    if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized: Please log in to update your profile" }, 
      { status: 401 }
    );
  }

    const result = await prisma.$transaction(async (tx) => {
      const updatedProfile = await tx.vendorProfile.update({
        where: { userId: session.user.id },
        data: {
          storeName: body.storeName ?? undefined,
          bio: body.bio ?? undefined,
          logoUrl: body.logoUrl ?? undefined,
          coverUrl: body.coverUrl ?? undefined,
          // SOCIALS - Ensure these match your Prisma schema field names!
          instagram: body.instagram ?? undefined,
          whatsapp: body.whatsapp ?? undefined,
          twitter: body.twitter ?? undefined,
          facebook: body.facebook ?? undefined,
          // BANK DETAILS - Crucial for Admins
          bankName: body.bankName ?? undefined,
          accountNumber: body.accountNumber ?? undefined,
          accountName: body.accountName ?? undefined,
        },
      });

      // SYNC TO PUBLIC STORE: This makes it show on the public page
      await tx.vendorStore.updateMany({
        where: { vendorProfileId: updatedProfile.id },
        data: {
          name: body.storeName ?? undefined,
          description: body.bio ?? undefined,
          logo: body.logoUrl ?? undefined,
          banner: body.coverUrl ?? undefined,
        },
      });

      return updatedProfile;
    });

    return NextResponse.json({ profile: result });
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}