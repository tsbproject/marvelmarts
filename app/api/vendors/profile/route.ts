import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { prisma } from "@/app/lib/prisma";

import { requireVendor } from "@/app/lib/auth/guards";
import { handleApiError } from "@/app/lib/auth/api";
import {
  badRequest,
  notFound,
} from "@/app/lib/auth/errors";
import { VendorService } from "@/app/lib/services/vendor.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";



/* -------------------------------------------------------------------------- */
/*                               GET PROFILE                                  */
/* -------------------------------------------------------------------------- */

export async function GET() {
  try {
    const session = await requireVendor();

    const profile =
      await VendorService.getVendorProfileWithStore(
        session.user.id
      );

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
        await VendorService.getVendorProfileWithStoreOnly(
          session.user.id
        );
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
        VendorService.makeSlug(
          rawStoreName
        );

    const normalizedSlug =
      slug?.trim()?.toLowerCase() ||
      currentVendor.store?.slug ||
      generatedSlug;

    await VendorService.ensureStoreSlugAvailable(
      normalizedSlug,
      currentVendor.id
    );
   

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
          await VendorService.updateVendorProfile(
            session.user.id,
            currentVendor.id,
            normalizedSlug,
            currentVendor.storeName,
            profileData,
            hasBranding,
            hasBankDetails
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