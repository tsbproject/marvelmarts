import { badRequest } from "@/app/lib/auth/errors";
import { prisma } from "@/app/lib/prisma";

export class PaymentService {
  private static getSecretKey() {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      throw new Error(
        "PAYSTACK_SECRET_KEY is not configured."
      );
    }

    return secretKey;
  }

  static async initializeWalletFunding({
    email,
    userId,
    amount,
  }: {
    email: string;
    userId: string;
    amount: number;
  }) {
    if (amount < 500) {
      throw badRequest(
        "Minimum wallet funding amount is ₦500."
      );
    }

    const reference =
      `WALLET-${Date.now()}-${crypto.randomUUID()}`;

    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${this.getSecretKey()}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email,

          amount: amount * 100,

          reference,

          callback_url:
            `${process.env.NEXT_PUBLIC_APP_URL}/wallet/verify`,

          metadata: {
            type: "wallet",
            userId,
            amount,
          },
        }),
      }
    );

    const data = await response.json();

    if (
      !response.ok ||
      !data.status
    ) {
      throw badRequest(
        data.message ??
          "Unable to initialize payment."
      );
    }

    return {
      authorizationUrl:
        data.data.authorization_url,

      accessCode:
        data.data.access_code,

      reference,
    };
  }

  static async verifyTransaction(
    reference: string
  ) {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${this.getSecretKey()}`,
          "Content-Type": "application/json",
        },

        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(
        "Failed to verify Paystack transaction."
      );
    }

    const result = await response.json();

    if (
      !result.status ||
      result.data.status !== "success"
    ) {
      throw badRequest(
        "Transaction verification failed."
      );
    }

    return result.data;
  }

  static async initializeOrderPayment(
  order: {
    id: string;
    orderNumber: string;
  },
  email: string,
  total: number
) {
  const secretKey =
    process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    throw new Error(
      "PAYSTACK_SECRET_KEY is not configured."
    );
  }

  const response = await fetch(
    "https://api.paystack.co/transaction/initialize",
    {
      method: "POST",

      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        email,

        amount: Math.round(
          total * 100
        ),

        metadata: {
          orderId: order.id,

          orderNumber:
            order.orderNumber,

          custom_fields: [
            {
              display_name:
                "Order Number",

              variable_name:
                "order_number",

              value:
                order.orderNumber,
            },
          ],
        },

        callback_url:
          `${process.env.NEXT_PUBLIC_BASE_URL}/thank-you?orderNumber=${order.orderNumber}`,
      }),
    }
  );

  const result =
    await response.json();

  if (
    !response.ok ||
    !result.status
  ) {
    await prisma.order.update({
      where: {
        id: order.id,
      },

      data: {
        paymentStatus: false,
      },
    });

    throw new Error(
      result.message ??
        "Unable to initialize payment."
    );
  }

  await prisma.order.update({
    where: {
      id: order.id,
    },

    data: {
      paymentIntentId:
        result.data.reference,
    },
  });

  return {
    success: true,

    orderId: order.id,

    orderNumber:
      order.orderNumber,

    paymentReference:
      result.data.reference,

    url:
      result.data.authorization_url,

    authorizationUrl:
      result.data.authorization_url,
  };
}
}