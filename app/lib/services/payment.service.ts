import crypto from "crypto";

import { badRequest } from "@/app/lib/auth/errors";
import { prisma } from "@/app/lib/prisma";
import { paymentClient } from "@/app/lib/payments";
import { BoostService } from "./boost.service";
import { WalletService } from "./wallet.service";
import { OrderService } from "./order.service";
import { calculatePaymentFee } from "@/app/lib/payments/payment-fee";

export class PaymentService {
 

static async initializeWalletFunding({
  userId,
  email,
  amount,
  saveCard,
  returnUrl,
}: {
  userId: string;
  email: string;
  amount: number;
  saveCard?: boolean;
  returnUrl: string;
}) {
  if (amount < 500) {
    throw badRequest(
      "Minimum wallet funding amount is ₦500."
    );
  }

  const feeCalculation = calculatePaymentFee(
    amount,
    "WALLET_FUNDING"
  );

  const reference =
    `WALLET-${Date.now()}-${crypto.randomUUID()}`;

  const payment =
    await paymentClient.initialize({
      email,
      amount: feeCalculation.grossAmount,
      reference,
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`,
      metadata: {
        type: "wallet",
        userId,

        // Business amount the user wants credited.
        amount: feeCalculation.baseAmount,

        // Fee information used for payment reconciliation.
        processingFee: feeCalculation.processingFee,
        grossAmount: feeCalculation.grossAmount,

        saveCard,
        returnUrl,
      },
    });

  return {
    success: true,
    paymentReference: payment.reference,
    url: payment.authorizationUrl,
    authorizationUrl: payment.authorizationUrl,
    amount: feeCalculation.baseAmount,
    processingFee: feeCalculation.processingFee,
    grossAmount: feeCalculation.grossAmount,
  };
}

static async verifyTransaction(reference: string) {
  return paymentClient.verify(reference);
}


static async refund({
  reference,
  amount,
  reason,
}: {
  reference: string;
  amount?: number;
  reason?: string;
}) {
  if (!reference?.trim()) {
    throw badRequest(
      "Payment reference is required for refund."
    );
  }

  if (
    amount !== undefined &&
    (!Number.isFinite(amount) ||
      amount <= 0)
  ) {
    throw badRequest(
      "Refund amount must be greater than zero."
    );
  }

  return paymentClient.refund({
    reference: reference.trim(),
    amount,
    reason,
  });
}
   


 static async initializeOrderPayment(
  order: {
    id: string;
    orderNumber: string;
    paymentIntentId?: string | null;
    paymentAuthorizationUrl?: string | null;
    paymentInitializationStatus?: string | null;
    },
    email: string,
    total: number
    ): Promise<{
    success: true;
    orderId: string;
    orderNumber: string;
    paymentReference: string;
    url: string;
    authorizationUrl: string;
  }> {

  let ownsInitializationClaim = false;

  let paymentInitialized = false;

  try {
    /*
     * An existing completed payment belongs to this Order.
     * Reuse it instead of creating another Paystack
     * transaction for the same checkout attempt.
     */
    if (
      order.paymentIntentId &&
      order.paymentAuthorizationUrl
    ) {
      return {
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        paymentReference:
          order.paymentIntentId,
        url:
          order.paymentAuthorizationUrl,
        authorizationUrl:
          order.paymentAuthorizationUrl,
      };
    }

    /*
     * Defensive case: a Paystack reference exists but
     * its authorization URL was not persisted.
     *
     * Never create another payment for this Order.
     */
    if (order.paymentIntentId) {
      throw new Error(
        "Existing payment reference is missing its authorization URL."
      );
    }

    /*
     * Atomically claim payment initialization.
     *
     * Only one concurrent request can change the Order
     * from an unclaimed state to INITIALIZING.
     */
    const claim = await prisma.order.updateMany({
      where: {
        id: order.id,
        paymentIntentId: null,
        paymentInitializationStatus: null,
      },
      data: {
        paymentInitializationStatus:
          "INITIALIZING",
        paymentInitializationAt:
          new Date(),
      },
    });

    /*
     * This request successfully claimed the Order.
     */
    if (claim.count === 1) {
      ownsInitializationClaim = true;
    }

    /*
     * Another request already owns initialization.
     *
     * Wait briefly for that request to finish, then
     * reload the Order and reuse its payment if available.
     */
    if (!ownsInitializationClaim) {
      for (let attempt = 0; attempt < 20; attempt++) {
        await new Promise((resolve) =>
          setTimeout(resolve, 250)
        );

        const currentOrder =
          await prisma.order.findUnique({
            where: {
              id: order.id,
            },
            select: {
              id: true,
              orderNumber: true,
              paymentIntentId: true,
              paymentAuthorizationUrl: true,
              paymentInitializationStatus: true,
            },
          });

        if (
          currentOrder?.paymentIntentId &&
          currentOrder.paymentAuthorizationUrl
        ) {
          return {
            success: true,
            orderId: currentOrder.id,
            orderNumber:
              currentOrder.orderNumber,
            paymentReference:
              currentOrder.paymentIntentId,
            url:
              currentOrder.paymentAuthorizationUrl,
            authorizationUrl:
              currentOrder.paymentAuthorizationUrl,
          };
        }

        /*
         * The previous initializer failed and released
         * the claim. This request may now try again.
         */
        if (
          currentOrder?.paymentInitializationStatus ===
          null
        ) {
          return this.initializeOrderPayment(
            {
              id: currentOrder.id,
              orderNumber:
                currentOrder.orderNumber,
              paymentIntentId:
                currentOrder.paymentIntentId,
              paymentAuthorizationUrl:
                currentOrder.paymentAuthorizationUrl,
              paymentInitializationStatus:
                currentOrder.paymentInitializationStatus,
            },
            email,
            total
          );
        }
      }

      /*
       * Do not automatically reclaim an old INITIALIZING
       * payment state.
       *
       * The original request may have successfully created
       * a Paystack transaction before the application failed
       * to persist its reference.
       */
      throw new Error(
        "Payment initialization is still in progress. Please retry shortly."
      );
    }

    /*
     * This request owns initialization.
     */
    const payment =
      await paymentClient.initialize({
        email,
        amount: total,
        reference:
          `ORDER-${order.orderNumber}-${Date.now()}`,
        callbackUrl:
          `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`,
        metadata: {
          type: "order",
          orderId: order.id,
          orderNumber: order.orderNumber,
          returnUrl:
            `/thank-you?orderNumber=${order.orderNumber}`,

          custom_fields: [
            {
              display_name: "Order Number",
              variable_name: "order_number",
              value: order.orderNumber,
            },
          ],
        },
      });

      paymentInitialized = true;

    /*
     * Persist the Paystack reference and authorization URL
     * together with the completed initialization state.
     */
    await prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        paymentIntentId:
          payment.reference,
        paymentAuthorizationUrl:
          payment.authorizationUrl,
        paymentInitializationStatus:
          "COMPLETED",
        paymentInitializationAt:
          new Date(),
      },
    });

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentReference:
        payment.reference,
      url:
        payment.authorizationUrl,
      authorizationUrl:
        payment.authorizationUrl,
    };
  } catch (error) {
    /*
     * Only the request that successfully claimed the
     * initialization lock may release it.
     */
    if (
      ownsInitializationClaim &&
      !paymentInitialized
    ) {
      await prisma.order.updateMany({
        where: {
          id: order.id,
          paymentIntentId: null,
          paymentInitializationStatus:
            "INITIALIZING",
        },
        data: {
          paymentInitializationStatus: null,
          paymentInitializationAt: null,
          paymentStatus: false,
        },
      });
    }

    throw error;
  }
}

static async savePaymentMethod(
  userId: string,
  reference: string
) {
  const transaction =
  await this.verifyTransaction(reference);

const authorization =
  transaction.raw?.authorization;

  if (!authorization?.authorization_code) {
    throw badRequest(
      "Reusable payment authorization was not returned."
    );
  }

  const existingCard =
    await prisma.paymentMethod.findFirst({
      where: {
        userId,
        provider: "PAYSTACK",
        providerId:
          authorization.authorization_code,
      },
      select: {
        id: true,
      },
    });

  if (existingCard) {
    return {
      existing: true,
      paymentMethod: existingCard,
    };
  }

  const hasDefaultCard =
    await prisma.paymentMethod.findFirst({
      where: {
        userId,
        isDefault: true,
      },
      select: {
        id: true,
      },
    });

  const paymentMethod =
    await prisma.paymentMethod.create({
      data: {
        userId,
        provider: "PAYSTACK",
        providerId:
          authorization.authorization_code,
        cardType:
          authorization.brand,
        last4:
          authorization.last4,
        expiryMonth:
          authorization.exp_month,
        expiryYear:
          authorization.exp_year
            .toString()
            .slice(-2),
        isDefault:
          !hasDefaultCard,
        metadata: transaction.raw,
      },
    });

  return {
    existing: false,
    paymentMethod,
  };
}


static async processBoostCreditPayment(
  metadata: any,
  reference: string,
  verifiedAmount: number
) {
  if (!metadata.custom_fields) {
    return {
      handled: false,
      success: true,
    };
  }

  const vendorField =
    metadata.custom_fields.find(
      (f: any) =>
        f.variable_name ===
        "vendor_id"
    );

  const creditsField =
    metadata.custom_fields.find(
      (f: any) =>
        f.variable_name ===
        "credits"
    );

  if (
    !vendorField ||
    !creditsField
  ) {
    return {
      handled: false,
      success: true,
    };
  }


  const grossAmount =
  Number(metadata.grossAmount);

    if (
      !Number.isFinite(grossAmount) ||
      grossAmount <= 0
    ) {
      throw badRequest(
        "Invalid Boost payment amount."
      );
    }

    const verifiedAmountNaira =
      verifiedAmount / 100;

    const amountDifference = Math.abs(
      verifiedAmountNaira - grossAmount
    );

    if (amountDifference > 0.01) {
      throw badRequest(
        "Boost payment amount does not match the expected amount."
      );
    }

  const existing =
    await prisma.creditTransaction.findUnique({
      where: {
        reference,
      },
    });

  if (existing) {
  return {
    handled: true,
    success: true,
    returnUrl: metadata.returnUrl,
  };
}

  const result =
    await BoostService.addCreditsToVendor(
      vendorField.value,
      Number(creditsField.value),
      reference
    );



    if (!result.success) {
      return {
        handled: true,
        success: false,
        error: result.error,
        returnUrl: metadata.returnUrl,
      };
    }

    return {
      handled: true,
      success: true,
      returnUrl: metadata.returnUrl,
    };
}


static async initializeBoostCreditPayment({
  email,
  vendorProfileId,
  credits,
  amount,
}: {
  email: string;
  vendorProfileId: string;
  credits: number;
  amount: number;
}) {
  if (
    !Number.isFinite(credits) ||
    credits <= 0
  ) {
    throw badRequest(
      "Boost credit amount must be greater than zero."
    );
  }

  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    throw badRequest(
      "Boost payment amount must be greater than zero."
    );
  }

  const feeCalculation =
    calculatePaymentFee(
      amount,
      "BOOST_CREDIT"
    );

  const reference =
    `BOOST-${Date.now()}-${crypto.randomUUID()}`;

  const payment =
    await paymentClient.initialize({
      email,
      amount: feeCalculation.grossAmount,
      reference,
      callbackUrl:
        `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`,
      metadata: {
        type: "vendor-credit",

        returnUrl:
          "/account/vendor/credit-boost",

        /*
         * The amount of Boost credits the vendor
         * actually purchased.
         */
        credits: credits.toString(),

        /*
         * Preserve the business amount separately
         * from the gross Paystack charge.
         */
        amount: feeCalculation.baseAmount,
        processingFee:
          feeCalculation.processingFee,
        grossAmount:
          feeCalculation.grossAmount,

        custom_fields: [
          {
            display_name: "Vendor ID",
            variable_name: "vendor_id",
            value: vendorProfileId,
          },
          {
            display_name: "Credits",
            variable_name: "credits",
            value: credits.toString(),
          },
        ],
      },
    });

  return {
    success: true,
    paymentReference: payment.reference,
    authorizationUrl:
      payment.authorizationUrl,
    url:
      payment.authorizationUrl,

    amount: feeCalculation.baseAmount,
    processingFee:
      feeCalculation.processingFee,
    grossAmount:
      feeCalculation.grossAmount,
  };
}

static async completePayment(
  reference: string,
  userId: string
) {
  if (!reference?.trim()) {
    throw badRequest(
      "Payment reference is required."
    );
  }

  if (!userId?.trim()) {
    throw badRequest(
      "Authenticated user is required."
    );
  }

  const transaction =
    await this.verifyTransaction(
      reference.trim()
    );

  if (!transaction.success) {
    throw badRequest(
      "Payment verification failed."
    );
  }

  const metadata =
    transaction.metadata ?? {};

  switch (metadata.type) {
    case "wallet": {
      if (
        typeof metadata.userId !== "string" ||
        metadata.userId !== userId
      ) {
        throw badRequest(
          "Payment does not belong to this user."
        );
      }

      return WalletService.completeWalletFunding(
        transaction
      );
    }

    case "order": {
      if (
        typeof metadata.orderId !== "string" ||
        !metadata.orderId
      ) {
        throw badRequest(
          "Order ID missing from payment metadata."
        );
      }

      const order =
        await prisma.order.findUnique({
          where: {
            id: metadata.orderId,
          },
          select: {
            id: true,
            userId: true,
          },
        });

      if (!order) {
        throw badRequest(
          "Order not found."
        );
      }

      if (
        !order.userId ||
        order.userId !== userId
      ) {
        throw badRequest(
          "Payment does not belong to this user."
        );
      }

      return OrderService.completeOrderPayment(
        transaction
      );
    }

    case "vendor-credit": {
      const vendorProfileId =
        metadata.custom_fields &&
        Array.isArray(
          metadata.custom_fields
        )
          ? (
              metadata.custom_fields as Array<{
                variable_name?: unknown;
                value?: unknown;
              }>
            ).find(
              (field) =>
                field.variable_name ===
                "vendor_id"
            )?.value
          : undefined;

      if (
        typeof vendorProfileId !==
          "string" ||
        !vendorProfileId
      ) {
        throw badRequest(
          "Vendor profile is missing from payment metadata."
        );
      }

      const vendor =
        await prisma.vendorProfile.findUnique({
          where: {
            id: vendorProfileId,
          },
          select: {
            id: true,
            userId: true,
          },
        });

      if (!vendor) {
        throw badRequest(
          "Vendor profile not found."
        );
      }

      if (
        vendor.userId !== userId
      ) {
        throw badRequest(
          "Payment does not belong to this vendor."
        );
      }

      return this.processBoostCreditPayment(
        transaction.metadata ?? {},
        transaction.reference,
        transaction.amount
      );
    }

    default:
      throw badRequest(
        "Unsupported payment type."
      );
  }
}





  static async setDefaultPaymentMethod(
  userId: string,
  methodId: string
) {
  const paymentMethod =
    await prisma.paymentMethod.findFirst({
      where: {
        id: methodId,
        userId,
      },
      select: {
        id: true,
      },
    });

  if (!paymentMethod) {
    return {
      success: false,
      error: "Payment method not found.",
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.paymentMethod.updateMany({
      where: {
        userId,
      },
      data: {
        isDefault: false,
      },
    });

    await tx.paymentMethod.update({
      where: {
        id: methodId,
      },
      data: {
        isDefault: true,
      },
    });
  });

  return {
    success: true,
  };
}


static async deletePaymentMethod(
  userId: string,
  cardId: string
) {
  const userCards =
    await prisma.paymentMethod.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        isDefault: true,
      },
    });

  if (userCards.length <= 1) {
    return {
      success: false,
      error:
        "You must have at least one payment method. Please add another before deleting this one.",
    };
  }

  const cardToDelete =
    userCards.find(
      (card) => card.id === cardId
    );

  if (!cardToDelete) {
    return {
      success: false,
      error: "Payment method not found.",
    };
  }

  await prisma.$transaction(async (tx) => {
    if (cardToDelete.isDefault) {
      const nextCard =
        userCards.find(
          (card) => card.id !== cardId
        );

      if (nextCard) {
        await tx.paymentMethod.update({
          where: {
            id: nextCard.id,
          },
          data: {
            isDefault: true,
          },
        });
      }
    }

    await tx.paymentMethod.delete({
      where: {
        id: cardId,
      },
    });
  });

  return {
    success: true,
  };
}

       
}
