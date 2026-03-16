




// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { revalidatePath } from "next/cache";
// import { authOptions } from "@/app/lib/auth";
// import { prisma } from "@/app/lib/prisma";
// import { Payout, VendorStore } from "@prisma/client";

// export async function GET() {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

//     const vendor = await prisma.vendorProfile.findUnique({
//       where: { userId: session.user.id },
//       include: { 
//         store: true, // Crucial: include the store to get the slug
//         _count: { select: { products: true } } 
//       },
//     });

//     if (!vendor) return NextResponse.json({ message: "Not Found" }, { status: 404 });

//     return NextResponse.json({
//       profile: vendor,
//       balance: Number(vendor.balance || 0),
//       onboarding: {
//         profileDone: vendor.profileDone,
//         storeDone: vendor.storeDone,
//         payoutsDone: vendor.payoutsDone,
//         productDone: vendor._count.products > 0,
//       }
//     });
//   } catch (error) {
//     return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
//   }
// }



// export async function PATCH(req: Request) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

//     const body = await req.json();
//     const { slug, ...profileData } = body;

//     // 1. Slug availability check
//     if (slug) {
//       const existingStore = await prisma.vendorStore.findFirst({
//         where: { 
//           slug: slug,
//           vendorProfileId: { not: session.user.id } 
//         }
//       });
//       if (existingStore) {
//         return NextResponse.json({ message: "This Store URL is already taken." }, { status: 400 });
//       }
//     }

//     // 2. Logic for onboarding flag calculation
//     const hasBankDetails = !!profileData.bankName && !!profileData.accountNumber;
//     const hasBranding = !!profileData.storeName && !!slug;

//     // 3. Perform atomic updates
//     const result = await prisma.$transaction(async (tx) => {
//       // Update the main profile
//       const profile = await tx.vendorProfile.update({
//         where: { userId: session.user.id },
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
//           // Sync flags
//           storeDone: hasBranding,
//           payoutsDone: hasBankDetails,
//         }
//       });

//       // Update or Create the Store record for the slug
//       if (slug) {
//         await tx.vendorStore.upsert({
//           where: { vendorProfileId: profile.id },
//           update: { 
//             name: profileData.storeName, 
//             slug: slug 
//           },
//           create: { 
//             vendorProfileId: profile.id, 
//             name: profileData.storeName, 
//             slug: slug 
//           },
//         });
//       }

//       return profile;
//     });

//     // 4. Force revalidation to update Server Components (Dashboard)
//     revalidatePath("/account/vendor");

//     return NextResponse.json({ 
//       message: "Settings updated successfully", 
//       profile: result 
//     });

//   } catch (error: any) {
//     console.error("PATCH Error:", error);
//     return NextResponse.json({ message: "Failed to save settings" }, { status: 500 });
//   }
// }






// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { revalidatePath } from "next/cache";
// import { authOptions } from "@/app/lib/auth";
// import { prisma } from "@/app/lib/prisma";

// export async function PATCH(req: Request) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.id) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//     }

//     const body = await req.json();
//     const { slug, ...profileData } = body;

//     if (slug) {
//       const existingStore = await prisma.vendorStore.findFirst({
//         where: { 
//           slug: slug,
//           vendorProfileId: { not: session.user.id } 
//         }
//       });
//       if (existingStore) {
//         return NextResponse.json({ message: "This Store URL is already taken." }, { status: 400 });
//       }
//     }

//     const currentVendor = await prisma.vendorProfile.findUnique({
//       where: { userId: session.user.id },
//       include: { store: true },
//     });

//     if (!currentVendor) {
//       return NextResponse.json({ message: "Vendor profile not found" }, { status: 404 });
//     }

//     const normalizedSlug = slug?.trim().toLowerCase();

//     if (normalizedSlug) {
//       const existingStore = await prisma.vendorStore.findFirst({
//         where: {
//           slug: normalizedSlug,
//           vendorProfileId: { not: currentVendor.id },
//         },
//       });

//       if (existingStore) {
//         return NextResponse.json(
//           { message: "This Store URL is already taken." },
//           { status: 400 }
//         );
//       }
//     }

//     const hasBranding = !!(
//       profileData.logoUrl &&
//       profileData.coverUrl &&
//       profileData.storeName &&
//       normalizedSlug
//     );

//     const hasBankDetails = !!(
//       profileData.bankName &&
//       profileData.accountNumber &&
//       String(profileData.accountNumber).length >= 10 &&
//       profileData.accountName
//     );

//     const result = await prisma.$transaction(async (tx) => {
//       const profile = await tx.vendorProfile.update({
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

//       if (normalizedSlug) {
//         await tx.vendorStore.upsert({
//           where: { vendorProfileId: currentVendor.id },
//           update: {
//             name: profileData.storeName,
//             slug: normalizedSlug,
//           },
//           create: {
//             vendorProfileId: currentVendor.id,
//             name: profileData.storeName,
//             slug: normalizedSlug,
//           },
//         });
//       }

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
          name: profileData.storeName || currentVendor.storeName || currentVendor.store?.name || "",
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