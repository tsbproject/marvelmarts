import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/app/lib/prisma";

import { requireAuth } from "@/app/lib/auth/guards";
import { handleApiError } from "@/app/lib/auth/api";
import { badRequest } from "@/app/lib/auth/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest
) {
  try {
    const session =
      await requireAuth();

    const {
      amount,
      items,
      shippingAddress,
    } = await req.json();

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      throw badRequest(
        "No checkout items provided."
      );
    }

    const vendorProfileId =
      items[0]?.vendorProfileId;

    if (!vendorProfileId) {
      throw badRequest(
        "Vendor profile is required."
      );
    }

    const mixedVendors =
      items.some(
        (item: any) =>
          item.vendorProfileId &&
          item.vendorProfileId !==
            vendorProfileId
      );

    if (mixedVendors) {
      throw badRequest(
        "Wallet checkout currently supports one vendor per order."
      );
    }

    const numericAmount =
      Number(amount);

    if (
      !Number.isFinite(
        numericAmount
      ) ||
      numericAmount <= 0
    ) {
      throw badRequest(
        "Invalid payment amount."
      );
    }

    const order =
      await prisma.$transaction(
        async (tx) => {
          const user =
            await tx.user.update({
              where: {
                id: session.user.id,
              },
              data: {
                walletBalance: {
                  decrement:
                    numericAmount,
                },
              },
            });

          if (
            Number(
              user.walletBalance
            ) < 0
          ) {
            throw badRequest(
              "Insufficient wallet balance."
            );
          }

          return tx.order.create({
            data: {
              userId: user.id,
              vendorProfileId,

              subtotal:
                new Prisma.Decimal(
                  numericAmount
                ),

              shipping:
                new Prisma.Decimal(
                  0
                ),

              tax:
                new Prisma.Decimal(
                  0
                ),

              total:
                new Prisma.Decimal(
                  numericAmount
                ),

              paymentStatus: true,
              paymentTypes:
                "WALLET",

              status:
                "pending",

              email:
                shippingAddress?.email ??
                session.user.email,

              firstName:
                shippingAddress?.firstName ??
                null,

              lastName:
                shippingAddress?.lastName ??
                null,

              phone:
                shippingAddress?.phone ??
                null,

              streetAddress:
                shippingAddress?.streetAddress ??
                null,

              apartment:
                shippingAddress?.apartment ??
                null,

              city:
                shippingAddress?.city ??
                null,

              state:
                shippingAddress?.state ??
                null,

              items: {
                create: items.map(
                  (
                    item: any
                  ) => ({
                    productId:
                      item.productId ??
                      null,

                    variantId:
                      item.variantId ??
                      null,

                    qty:
                      Number(
                        item.quantity
                      ) || 1,

                    unitPrice:
                      new Prisma.Decimal(
                        Number(
                          item.price
                        ) || 0
                      ),

                    imageUrl:
                      item.imageUrl ??
                      null,

                    title:
                      item.title ??
                      null,
                  })
                ),
              },
            },
          });
        }
      );

    return NextResponse.json(
      {
        success: true,
        orderId: order.id,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}