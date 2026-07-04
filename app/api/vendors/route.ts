import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";

import {
  requireManageVendors,
  requireAuth,
} from "@/app/lib/auth/guards";

import { handleApiError } from "@/app/lib/auth/api";
import {
  badRequest,
  notFound,
} from "@/app/lib/auth/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* -------------------------------------------------------------------------- */
/*                               GET VENDORS                                  */
/* -------------------------------------------------------------------------- */

export async function GET() {
  try {
    await requireManageVendors();

    const vendors = await prisma.vendorProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        onboarding: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      {
        success: true,
        vendors,
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
/*                           UPDATE STORE SETUP                               */
/* -------------------------------------------------------------------------- */

export async function PATCH(
  req: NextRequest
) {
  try {
    const session =
      await requireAuth();

    const body = await req.json();

    const {
      storeName,
      storePhone,
      storeAddress,
      logoUrl,
      coverUrl,
    } = body;

    const vendor =
      await prisma.vendorProfile.findUnique({
        where: {
          userId: session.user.id,
        },
        select: {
          id: true,
        },
      });

    if (!vendor) {
      throw notFound(
        "Vendor profile not found."
      );
    }

    if (
      !storeName?.trim()
    ) {
      throw badRequest(
        "Store name is required."
      );
    }

    const updatedVendor =
      await prisma.$transaction(
        async (tx) => {
          const profile =
            await tx.vendorProfile.update({
              where: {
                userId:
                  session.user.id,
              },
              data: {
                storeName,
                storePhone,
                storeAddress,
                logoUrl,
                coverUrl,
              },
            });

          await tx.vendorOnboarding.update({
            where: {
              vendorProfileId:
                profile.id,
            },
            data: {
              storeDone: true,
            },
          });

          return profile;
        }
      );

    return NextResponse.json(
      {
        success: true,
        vendor: updatedVendor,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}