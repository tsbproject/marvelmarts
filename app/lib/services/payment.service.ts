import crypto from "crypto";

import { badRequest } from "@/app/lib/auth/errors";
import { prisma } from "@/app/lib/prisma";

import { paymentClient } from "@/app/lib/payments";
export class PaymentService {
 

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

  const payment =
    await paymentClient.initialize({
      email,
      amount,
      reference,
      callbackUrl:
        `${process.env.NEXT_PUBLIC_APP_URL}/wallet/verify`,
      metadata: {
        type: "wallet",
        userId,
        amount,
      },
    });

  return {
    publicKey:
      process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
    email,
    amount,
    reference: payment.reference,
  };
}

 static async verifyTransaction(reference: string) {
  const payment =
    await paymentClient.verify(reference);

  return payment.raw;
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
          `${process.env.NEXT_PUBLIC_BASE_URL}/thank-you?orderNumber=${order.orderNumber}`,
        metadata: {
          type: "order",
          orderId: order.id,
          orderNumber: order.orderNumber,
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

 

       
}
