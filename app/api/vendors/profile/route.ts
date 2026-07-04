import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/app/lib/prisma";

import { requireVendor } from "@/app/lib/auth/guards";
import { handleApiError } from "@/app/lib/auth/api";
import {
  badRequest,
  notFound,
} from "@/app/lib/auth/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function makeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/* -------------------------------------------------------------------------- */
/*                               GET PROFILE                                  */
/* -------------------------------------------------------------------------- */

export async function GET() {
  try {
    const session = await requireVendor();

    const profile = await prisma.vendorProfile.findUnique({
      where: {
        userId: session.user.id,
      },
      include: {
        store: true,
        onboarding: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!profile) {
      throw notFound(
        "Vendor profile not found."
      );
    }

    return NextResponse.json(
      {
        success: true,
        profile,
        onboarding: {
          profileDone:
            profile.profileDone ?? false,
          storeDone:
            profile.storeDone ?? false,
          payoutsDone:
            profile.payoutsDone ?? false,
          productDone:
            (profile._count.products ?? 0) > 0,
        },
        balance: Number(
          profile.balance
        ),
        roles:
          session.user.roles ??
          [session.user.role],
        verificationStatus:
          profile.status,
        lastSyncedAt:
          new Date().toISOString(),
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/* -------------------------------------------------------------------------- */
/*                             UPDATE PROFILE                                 */
/* -------------------------------------------------------------------------- */

export async function PATCH(
  req: NextRequest
) {
  try {
    const session =
      await requireVendor();

    const body = await req.json();

    const {
      slug,
      ...profileData
    } = body;

    const currentVendor =
      await prisma.vendorProfile.findUnique({
        where: {
          userId:
            session.user.id,
        },
        include: {
          store: true,
        },
      });

    if (!currentVendor) {
      throw notFound(
        "Vendor profile not found."
      );
    }

    const rawStoreName =
      profileData.storeName ||
      currentVendor.storeName ||
      "";

    if (!rawStoreName) {
      throw badRequest(
        "Store name is required."
      );
    }

    const generatedSlug =
      makeSlug(rawStoreName);

    const normalizedSlug =
      slug?.trim()?.toLowerCase() ||
      currentVendor.store?.slug ||
      generatedSlug;

    const existingStore =
      await prisma.vendorStore.findFirst({
        where: {
          slug: normalizedSlug,
          vendorProfileId: {
            not: currentVendor.id,
          },
        },
      });

    if (existingStore) {
      throw badRequest(
        "Store URL is already in use."
      );
    }

    const hasBranding =
      !!(
        profileData.logoUrl &&
        profileData.coverUrl &&
        rawStoreName
      );

    const hasBankDetails =
      !!(
        profileData.bankName &&
        profileData.accountName &&
        profileData.accountNumber &&
        String(
          profileData.accountNumber
        ).length >= 10
      );

    const updatedVendor =
      await prisma.$transaction(
        async (tx) => {
          await tx.vendorProfile.update({
            where: {
              id:
                currentVendor.id,
            },
            data: {
              storeName:
                profileData.storeName,
              bio:
                profileData.bio,
              logoUrl:
                profileData.logoUrl,
              coverUrl:
                profileData.coverUrl,
              instagram:
                profileData.instagram,
              whatsapp:
                profileData.whatsapp,
              facebook:
                profileData.facebook,
              bankName:
                profileData.bankName,
              accountName:
                profileData.accountName,
              accountNumber:
                profileData.accountNumber,
              storeDone:
                hasBranding,
              payoutsDone:
                hasBankDetails,
            },
          });

          await tx.vendorStore.upsert({
            where: {
              vendorProfileId:
                currentVendor.id,
            },
            update: {
              name:
                profileData.storeName ||
                currentVendor.storeName,
              slug:
                normalizedSlug,
            },
            create: {
              vendorProfileId:
                currentVendor.id,
              name:
                profileData.storeName ||
                currentVendor.storeName,
              slug:
                normalizedSlug,
            },
          });

          return tx.vendorProfile.findUnique({
            where: {
              id:
                currentVendor.id,
            },
            include: {
              store: true,
              _count: {
                select: {
                  products: true,
                },
              },
            },
          });
        }
      );

    revalidatePath(
      "/account/vendor"
    );
    revalidatePath(
      "/account/vendor/store-settings"
    );

    if (
      updatedVendor?.store?.slug
    ) {
      revalidatePath(
        `/store/${updatedVendor.store.slug}`
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Vendor profile updated successfully.",
        profile:
          updatedVendor,
        onboarding: {
          profileDone:
            updatedVendor?.profileDone ??
            false,
          storeDone:
            updatedVendor?.storeDone ??
            false,
          payoutsDone:
            updatedVendor?.payoutsDone ??
            false,
          productDone:
            (
              updatedVendor?._count
                ?.products ?? 0
            ) > 0,
        },
        balance: Number(
          updatedVendor?.balance ??
            0
        ),
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}