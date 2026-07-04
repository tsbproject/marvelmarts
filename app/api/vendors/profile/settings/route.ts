import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";

import { requireVendor } from "@/app/lib/auth/guards";
import { handleApiError } from "@/app/lib/auth/api";
import { notFound } from "@/app/lib/auth/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest
) {
  try {
    const session =
      await requireVendor();

    const body = await req.json();

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

    const updatedProfile =
      await prisma.$transaction(
        async (tx) => {
          const profile =
            await tx.vendorProfile.update({
              where: {
                userId:
                  session.user.id,
              },
              data: {
                storeName:
                  body.storeName ??
                  undefined,

                bio:
                  body.bio ??
                  undefined,

                logoUrl:
                  body.logoUrl ??
                  undefined,

                coverUrl:
                  body.coverUrl ??
                  undefined,

                instagram:
                  body.instagram ??
                  undefined,

                whatsapp:
                  body.whatsapp ??
                  undefined,

                twitter:
                  body.twitter ??
                  undefined,

                facebook:
                  body.facebook ??
                  undefined,

                bankName:
                  body.bankName ??
                  undefined,

                accountNumber:
                  body.accountNumber ??
                  undefined,

                accountName:
                  body.accountName ??
                  undefined,
              },
            });

          await tx.vendorStore.updateMany({
            where: {
              vendorProfileId:
                profile.id,
            },
            data: {
              name:
                body.storeName ??
                undefined,

              description:
                body.bio ??
                undefined,

              logo:
                body.logoUrl ??
                undefined,

              banner:
                body.coverUrl ??
                undefined,
            },
          });

          return profile;
        }
      );

    return NextResponse.json(
      {
        success: true,
        profile:
          updatedProfile,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}