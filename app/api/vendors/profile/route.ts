// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { revalidatePath } from "next/cache";
// import { authOptions } from "@/app/lib/auth";
// import { prisma } from "@/app/lib/prisma";

// function makeSlug(value: string) {
//   return value
//     .trim()
//     .toLowerCase()
//     .replace(/[^a-z0-9\s-]/g, "")
//     .replace(/\s+/g, "-")
//     .replace(/-+/g, "-")
//     .replace(/^-|-$/g, "");
// }

// export async function PATCH(req: Request) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.id) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//     }

//     const body = await req.json();
//     const { slug, ...profileData } = body;

//     const currentVendor = await prisma.vendorProfile.findUnique({
//       where: { userId: session.user.id },
//       include: { store: true },
//     });

//     if (!currentVendor) {
//       return NextResponse.json({ message: "Vendor profile not found" }, { status: 404 });
//     }

//     const rawStoreName = profileData.storeName || currentVendor.storeName || "";
//     const generatedSlug = rawStoreName ? makeSlug(rawStoreName) : "";
//     const normalizedSlug =
//       slug?.trim()?.toLowerCase() || currentVendor.store?.slug || generatedSlug;

//     if (!normalizedSlug) {
//       return NextResponse.json(
//         { message: "Store slug could not be generated. Please provide a store name." },
//         { status: 400 }
//       );
//     }

//     const existingStore = await prisma.vendorStore.findFirst({
//       where: {
//         slug: normalizedSlug,
//         vendorProfileId: { not: currentVendor.id },
//       },
//     });

//     if (existingStore) {
//       return NextResponse.json(
//         { message: "This Store URL is already taken." },
//         { status: 400 }
//       );
//     }

//     const hasBranding = !!(
//       profileData.logoUrl &&
//       profileData.coverUrl &&
//       rawStoreName &&
//       normalizedSlug
//     );

//     const hasBankDetails = !!(
//       profileData.bankName &&
//       profileData.accountNumber &&
//       String(profileData.accountNumber).length >= 10 &&
//       profileData.accountName
//     );

//     const result = await prisma.$transaction(async (tx) => {
//       await tx.vendorProfile.update({
//         where: { id: currentVendor.id },
//         data: {
//           storeName: profileData.storeName,
//           bio: profileData.bio,
//           logoUrl: profileData.logoUrl,
//           coverUrl: profileData.coverUrl,
//           instagram: profileData.instagram,
//           whatsapp: profileData.whatsapp,
//           facebook: profileData.facebook,
//           bankName: profileData.bankName,
//           accountNumber: profileData.accountNumber,
//           accountName: profileData.accountName,
//           storeDone: hasBranding,
//           payoutsDone: hasBankDetails,
//         },
//       });

//       await tx.vendorStore.upsert({
//         where: { vendorProfileId: currentVendor.id },
//         update: {
//           name: profileData.storeName || currentVendor.storeName || currentVendor.store?.name || "",
//           slug: normalizedSlug,
//         },
//         create: {
//           vendorProfileId: currentVendor.id,
//           name: profileData.storeName || currentVendor.storeName || "",
//           slug: normalizedSlug,
//         },
//       });

//       const updatedVendor = await tx.vendorProfile.findUnique({
//         where: { id: currentVendor.id },
//         include: {
//           store: true,
//           _count: { select: { products: true } },
//         },
//       });

//       return updatedVendor;
//     });

//     revalidatePath("/account/vendor");
//     revalidatePath("/account/vendor/store-settings");
//     revalidatePath(`/store/${result?.store?.slug}`);

//     return NextResponse.json({
//       message: "Settings updated successfully",
//       profile: result,
//       onboarding: {
//         profileDone: result?.profileDone ?? false,
//         storeDone: result?.storeDone ?? false,
//         payoutsDone: result?.payoutsDone ?? false,
//         productDone: (result?._count?.products ?? 0) > 0,
//       },
//       balance: Number(result?.balance || 0),
//     });
//   } catch (error: any) {
//     console.error("PATCH Error:", error);
//     return NextResponse.json({ message: "Failed to save settings" }, { status: 500 });
//   }
// }





// export async function GET() {
//   try {
//     const session = await getServerSession(authOptions);

//     if (!session?.user?.id) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//     }

//     const profile = await prisma.vendorProfile.findUnique({
//       where: { userId: session.user.id },
//       include: {
//         store: true,
//         onboarding: true,
//         _count: {
//           select: { products: true },
//         },
//       },
//     });

//     if (!profile) {
//       return NextResponse.json({ message: "Vendor profile not found" }, { status: 404 });
//     }

//     return NextResponse.json({
//       profile,
//       onboarding: {
//         profileDone: profile.profileDone ?? false,
//         storeDone: profile.storeDone ?? false,
//         payoutsDone: profile.payoutsDone ?? false,
//         productDone: (profile._count?.products ?? 0) > 0,
//       },
//       balance: Number(profile.balance || 0),
//       roles: session.user.roles || (session.user.role ? [session.user.role] : []),
//       verificationStatus: profile.status || "NOT_STARTED",
//       lastSyncedAt: new Date().toISOString(),
//     });
//   } catch (error) {
//     console.error("GET /api/vendors/profile error:", error);
//     return NextResponse.json(
//       { message: "Failed to fetch vendor profile" },
//       { status: 500 }
//     );
//   }
// }




import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

function makeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.vendorProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        store: true,
        onboarding: true,
        _count: {
          select: { products: true },
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ message: "Vendor profile not found" }, { status: 404 });
    }

    return NextResponse.json({
      profile,
      onboarding: {
        profileDone: profile.profileDone ?? false,
        storeDone: profile.storeDone ?? false,
        payoutsDone: profile.payoutsDone ?? false,
        productDone: (profile._count?.products ?? 0) > 0,
      },
      balance: Number(profile.balance || 0),
      roles: session.user.roles || (session.user.role ? [session.user.role] : []),
      verificationStatus: profile.status || "NOT_STARTED",
      lastSyncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("GET /api/vendors/profile error:", error);
    return NextResponse.json(
      { message: "Failed to fetch vendor profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { slug, ...profileData } = body;

    const currentVendor = await prisma.vendorProfile.findUnique({
      where: { userId: session.user.id },
      include: { store: true },
    });

    if (!currentVendor) {
      return NextResponse.json({ message: "Vendor profile not found" }, { status: 404 });
    }

    const rawStoreName = profileData.storeName || currentVendor.storeName || "";
    const generatedSlug = rawStoreName ? makeSlug(rawStoreName) : "";
    const normalizedSlug =
      slug?.trim()?.toLowerCase() || currentVendor.store?.slug || generatedSlug;

    if (!normalizedSlug) {
      return NextResponse.json(
        { message: "Store slug could not be generated. Please provide a store name." },
        { status: 400 }
      );
    }

    const existingStore = await prisma.vendorStore.findFirst({
      where: {
        slug: normalizedSlug,
        vendorProfileId: { not: currentVendor.id },
      },
    });

    if (existingStore) {
      return NextResponse.json(
        { message: "This Store URL is already taken." },
        { status: 400 }
      );
    }

    const hasBranding = !!(
      profileData.logoUrl &&
      profileData.coverUrl &&
      rawStoreName &&
      normalizedSlug
    );

    const hasBankDetails = !!(
      profileData.bankName &&
      profileData.accountNumber &&
      String(profileData.accountNumber).length >= 10 &&
      profileData.accountName
    );

    const result = await prisma.$transaction(async (tx) => {
      await tx.vendorProfile.update({
        where: { id: currentVendor.id },
        data: {
          storeName: profileData.storeName,
          bio: profileData.bio,
          logoUrl: profileData.logoUrl,
          coverUrl: profileData.coverUrl,
          instagram: profileData.instagram,
          whatsapp: profileData.whatsapp,
          facebook: profileData.facebook,
          bankName: profileData.bankName,
          accountNumber: profileData.accountNumber,
          accountName: profileData.accountName,
          storeDone: hasBranding,
          payoutsDone: hasBankDetails,
        },
      });

      await tx.vendorStore.upsert({
        where: { vendorProfileId: currentVendor.id },
        update: {
          name:
            profileData.storeName ||
            currentVendor.storeName ||
            currentVendor.store?.name ||
            "",
          slug: normalizedSlug,
        },
        create: {
          vendorProfileId: currentVendor.id,
          name: profileData.storeName || currentVendor.storeName || "",
          slug: normalizedSlug,
        },
      });

      const updatedVendor = await tx.vendorProfile.findUnique({
        where: { id: currentVendor.id },
        include: {
          store: true,
          _count: { select: { products: true } },
        },
      });

      return updatedVendor;
    });

    revalidatePath("/account/vendor");
    revalidatePath("/account/vendor/store-settings");
    revalidatePath(`/store/${result?.store?.slug}`);

    return NextResponse.json({
      message: "Settings updated successfully",
      profile: result,
      onboarding: {
        profileDone: result?.profileDone ?? false,
        storeDone: result?.storeDone ?? false,
        payoutsDone: result?.payoutsDone ?? false,
        productDone: (result?._count?.products ?? 0) > 0,
      },
      balance: Number(result?.balance || 0),
    });
  } catch (error: any) {
    console.error("PATCH Error:", error);



    return NextResponse.json({ message: "Failed to save settings" }, { status: 500 });
  }
}