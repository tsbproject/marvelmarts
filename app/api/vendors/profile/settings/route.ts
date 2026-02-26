import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";



// export async function PATCH(req: Request) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.id) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//     }

//     const body = await req.json();
    
//     // Destructure everything from body
//     const { 
//       storeName, 
//       bio, 
//       logoUrl, 
//       coverUrl, 
//       bankName, 
//       accountNumber, 
//       accountName,
//       instagram,
//       twitter,
//       facebook,
//       whatsapp
//     } = body;

//     const result = await prisma.$transaction(async (tx) => {
//       // 1. Update the Vendor Profile
//       const updatedProfile = await tx.vendorProfile.update({
//         where: { userId: session.user.id },
//         data: {
//           // USE undefined TO PREVENT OVERWRITING EXISTING DATA WITH NULL
//           storeName: storeName || undefined,
//           bio: bio || undefined, 
//           logoUrl: logoUrl || undefined,
//           coverUrl: coverUrl || undefined,
//           bankName: bankName || undefined,
//           accountNumber: accountNumber || undefined,
//           accountName: accountName || undefined,
//           instagram: instagram || undefined,
//           twitter: twitter || undefined,
//           facebook: facebook || undefined,
//           whatsapp: whatsapp || undefined,
//           // Only mark store as done if we actually have name and logo in DB or current request
//           profileDone: true 
//         },
//       });

//       // 2. Sync with the Vendor Store (Public)
//       await tx.vendorStore.updateMany({
//         where: { vendorProfileId: updatedProfile.id },
//         data: {
//           name: storeName || undefined,
//           description: bio || undefined, 
//           logo: logoUrl || undefined,
//           banner: coverUrl || undefined,
//         },
//       });

//       // 3. Update User for Session
//       if (storeName) {
//         await tx.user.update({
//           where: { id: session.user.id },
//           data: { name: storeName },
//         });
//       }

//       return updatedProfile;
//     });

//     return NextResponse.json({
//       message: "Settings and Public Store updated successfully",
//       profile: result,
//     });

//   } catch (error: any) {
//     console.error("SETTINGS_PATCH_ERROR:", error);
//     return NextResponse.json(
//       { message: error.message || "Internal Server Error" }, 
//       { status: 500 }
//     );
//   }
// }



export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();

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