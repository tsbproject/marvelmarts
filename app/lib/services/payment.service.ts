import crypto from "crypto";

import { badRequest } from "@/app/lib/auth/errors";
import { prisma } from "@/app/lib/prisma";
import { paymentClient } from "@/app/lib/payments";
import { BoostService } from "./boost.service";
import { WalletService } from "./wallet.service";
import { OrderService } from "./order.service";

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

  const reference =
    `WALLET-${Date.now()}-${crypto.randomUUID()}`;

  const payment =
    await paymentClient.initialize({
      email,
      amount,
      reference,
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`,
      metadata: {
      type: "wallet",
      userId,
      amount,
      saveCard,
      returnUrl,
    },
    });

  return {
    success: true,
    paymentReference: payment.reference,
    url: payment.authorizationUrl,
    authorizationUrl: payment.authorizationUrl,
  };
}

static async verifyTransaction(reference: string) {
  return paymentClient.verify(reference);
}
   


 static async initializeOrderPayment(
  order: {
    id: string;
    orderNumber: string;
  },
  email: string,
  total: number
) {
  try {
    const payment =
      await paymentClient.initialize({
        email,
        amount: total,
        reference: `ORDER-${order.orderNumber}-${Date.now()}`,
        callbackUrl:
          `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`,
        metadata: {
            type: "order",
            orderId: order.id,
            orderNumber: order.orderNumber,
            returnUrl: `/thank-you?orderNumber=${order.orderNumber}`,

            custom_fields: [
              {
                display_name: "Order Number",
                variable_name: "order_number",
                value: order.orderNumber,
              },
            ],
          },
      });

    await prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        paymentIntentId: payment.reference,
      },
    });

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentReference: payment.reference,
      url: payment.authorizationUrl,
      authorizationUrl: payment.authorizationUrl,
    };
  } catch (error) {
    await prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        paymentStatus: false,
      },
    });

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
  reference: string
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
  const reference =
    `BOOST-${Date.now()}-${crypto.randomUUID()}`;

  const payment =
    await paymentClient.initialize({
      email,
      amount,
      reference,
      callbackUrl:
      `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`,
      metadata: {
      type: "vendor-credit",
      returnUrl: "/account/vendor/credit-boost",

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
        transaction.reference
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
