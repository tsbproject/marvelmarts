import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";

import { requireVendor } from "@/app/lib/auth/guards";
import { handleApiError } from "@/app/lib/auth/api";
import {
  badRequest,
  forbidden,
  notFound,
} from "@/app/lib/auth/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* -------------------------------------------------------------------------- */
/*                          UPDATE ORDER STATUS                               */
/* -------------------------------------------------------------------------- */

export async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const session = await requireVendor();

    const { id } = await params;

    const body = await req.json();

    const status = String(
      body.status ?? ""
    )
      .trim()
      .toUpperCase();

    const trackingNumber =
      body.trackingNumber ?? null;

    if (!status) {
      throw badRequest(
        "Order status is required."
      );
    }

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

    const order =
      await prisma.order.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          vendorProfileId: true,
        },
      });

    if (!order) {
      throw notFound(
        "Order not found."
      );
    }

    if (
      order.vendorProfileId !==
      vendor.id
    ) {
      throw forbidden(
        "You do not have permission to update this order."
      );
    }

    const updatedOrder =
      await prisma.order.update({
        where: {
          id,
        },
        data: {
          status,
          trackingNumber,
        },
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Order updated successfully.",
        order: updatedOrder,
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
/*                          GET SINGLE ORDER                                  */
/* -------------------------------------------------------------------------- */

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const session =
      await requireVendor();

    const { id } =
      await params;

    const vendor =
      await prisma.vendorProfile.findUnique({
        where: {
          userId:
            session.user.id,
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

    const order =
      await prisma.order.findUnique({
        where: {
          id,
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              image: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  title: true,
                  images: {
                    take: 1,
                    select: {
                      url: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

    if (!order) {
      throw notFound(
        "Order not found."
      );
    }

    if (
      order.vendorProfileId !==
      vendor.id
    ) {
      throw forbidden(
        "You do not have permission to access this order."
      );
    }

    return NextResponse.json(
      {
        success: true,
        order: {
          ...order,

          total: Number(
            order.total
          ),

          subtotal: Number(
            order.subtotal
          ),

          shipping: Number(
            order.shipping
          ),

          customerName:
            `${order.firstName ?? ""} ${order.lastName ?? ""}`.trim() ||
            order.user?.name,

          customerEmail:
            order.email ??
            order.user?.email,

          useDifferentShipping:
            order.useDifferentShipping,

          shippingDetails:
            order.useDifferentShipping
              ? {
                  firstName:
                    order.shippingFirstName,
                  lastName:
                    order.shippingLastName,
                  streetAddress:
                    order.shippingAddress,
                  city:
                    order.shippingCity,
                  state:
                    order.shippingState,
                }
              : null,

          productTitle:
            order.items[0]?.title ??
            order.items[0]?.product
              ?.title,

          productImage:
            order.items[0]
              ?.imageUrl ??
            order.items[0]
              ?.product
              ?.images?.[0]?.url,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}