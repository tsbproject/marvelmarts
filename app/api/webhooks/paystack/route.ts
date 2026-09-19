import { NextResponse } from "next/server";
import crypto from "crypto";

import { PaymentService } from "@/app/lib/services/payment.service";
import { WalletService } from "@/app/lib/services/wallet.service";
import { OrderService } from "@/app/lib/services/order.service";
import { logger } from "@/app/lib/logger";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = withApiLogging(
  async (req: Request) => {
    try {
      const secret =
        process.env.PAYSTACK_SECRET_KEY;

      if (!secret) {
        logger.error(
          "PAYSTACK_WEBHOOK_CONFIG_ERROR",
          "PAYSTACK_SECRET_KEY is not configured."
        );

        return NextResponse.json(
          {
            error:
              "Server configuration error.",
          },
          {
            status: 500,
          }
        );
      }

      /**
       * IMPORTANT:
       *
       * Paystack's signature must be calculated against
       * the raw request body.
       *
       * Do not use req.json() before signature verification.
       */
      const body = await req.text();

      const signature =
        req.headers.get(
          "x-paystack-signature"
        );

      if (!signature) {
        logger.warn(
          "PAYSTACK_WEBHOOK_MISSING_SIGNATURE"
        );

        return NextResponse.json(
          {
            error:
              "Missing webhook signature.",
          },
          {
            status: 401,
          }
        );
      }

      /**
       * Verify Paystack HMAC signature.
       */
      const expectedHash = crypto
        .createHmac("sha512", secret)
        .update(body)
        .digest("hex");

      const expectedBuffer =
        Buffer.from(
          expectedHash,
          "utf8"
        );

      const receivedBuffer =
        Buffer.from(
          signature,
          "utf8"
        );

      if (
        expectedBuffer.length !==
          receivedBuffer.length ||
        !crypto.timingSafeEqual(
          expectedBuffer,
          receivedBuffer
        )
      ) {
        logger.warn(
          "PAYSTACK_WEBHOOK_INVALID_SIGNATURE"
        );

        return NextResponse.json(
          {
            error:
              "Invalid signature.",
          },
          {
            status: 401,
          }
        );
      }

      /**
       * Parse webhook payload only after
       * signature verification.
       */
      let event: any;

      try {
        event = JSON.parse(body);
      } catch (error) {
        logger.error(
          "PAYSTACK_WEBHOOK_INVALID_JSON",
          error
        );

        return NextResponse.json(
          {
            error:
              "Invalid webhook payload.",
          },
          {
            status: 400,
          }
        );
      }

      /**
       * We currently process successful charges only.
       */
      if (
        event?.event !==
        "charge.success"
      ) {
        return NextResponse.json({
          received: true,
        });
      }

      const payment = event?.data;

      if (!payment) {
        logger.warn(
          "PAYSTACK_WEBHOOK_MISSING_DATA"
        );

        return NextResponse.json(
          {
            error:
              "Missing payment data.",
          },
          {
            status: 400,
          }
        );
      }

      /**
       * Paystack transaction reference.
       */
      const reference =
        typeof payment.reference ===
        "string"
          ? payment.reference.trim()
          : "";

      if (!reference) {
        logger.warn(
          "PAYSTACK_WEBHOOK_MISSING_REFERENCE"
        );

        return NextResponse.json(
          {
            error:
              "Missing payment reference.",
          },
          {
            status: 400,
          }
        );
      }

      /**
       * Payment metadata supplied during
       * transaction initialization.
       */
      const metadata =
        payment.metadata &&
        typeof payment.metadata ===
          "object"
          ? payment.metadata
          : {};

      /**
       * ==========================================================
       * WALLET FUNDING
       * ==========================================================
       */
      if (
        metadata.type === "wallet"
      ) {
        const userId =
          typeof metadata.userId ===
          "string"
            ? metadata.userId.trim()
            : "";

        if (!userId) {
          logger.warn(
            `PAYSTACK_WEBHOOK_WALLET_MISSING_USER: ${reference}`
          );

          return NextResponse.json(
            {
              error:
                "Wallet payment user is missing.",
            },
            {
              status: 400,
            }
          );
        }

        const amount = Number(
          payment.amount
        );

        if (
          !Number.isFinite(amount) ||
          amount <= 0
        ) {
          logger.warn(
            `PAYSTACK_WEBHOOK_WALLET_INVALID_AMOUNT: ${reference}`
          );

          return NextResponse.json(
            {
              error:
                "Invalid wallet payment amount.",
            },
            {
              status: 400,
            }
          );
        }

        const result =
          await WalletService.completeWalletFunding(
            payment
          );

        logger.info(
          `PAYSTACK_WALLET_PAYMENT_PROCESSED: ${reference}`
        );

        return NextResponse.json({
          success: true,
          received: true,
          alreadyProcessed:
            result.wallet
              ?.alreadyProcessed ??
            false,
          balance:
            result.wallet?.balance ??
            undefined,
        });
      }

      /**
       * ==========================================================
       * VENDOR BOOST CREDIT PAYMENT
       * ==========================================================
       */
      const boostResult =
        await PaymentService.processBoostCreditPayment(
          metadata,
          reference,
          payment.amount
        );

      if (boostResult.handled) {
        if (!boostResult.success) {
          if (
            boostResult.error ===
            "Transaction already processed."
          ) {
            logger.info(
              `PAYSTACK_BOOST_PAYMENT_ALREADY_PROCESSED: ${reference}`
            );

            return NextResponse.json({
              success: true,
              received: true,
              alreadyProcessed: true,
            });
          }

          logger.error(
            "PAYSTACK_BOOST_PAYMENT_FAILED",
            boostResult.error ??
              "Unable to process boost payment."
          );

          return NextResponse.json(
            {
              error:
                boostResult.error ??
                "Unable to process boost payment.",
            },
            {
              status: 500,
            }
          );
        }

        logger.info(
          `PAYSTACK_BOOST_PAYMENT_PROCESSED: ${reference}`
        );

        return NextResponse.json({
          success: true,
          received: true,
        });
      }

      /**
       * ==========================================================
       * ORDER PAYMENT
       * ==========================================================
       */
      const orderId =
        typeof metadata.orderId ===
        "string"
          ? metadata.orderId.trim()
          : "";

      if (!orderId) {
        logger.info(
          `PAYSTACK_WEBHOOK_UNHANDLED_PAYMENT: ${reference}`
        );

        return NextResponse.json({
          received: true,
        });
      }

      const orderNumber =
        typeof metadata.orderNumber ===
        "string"
          ? metadata.orderNumber.trim()
          : undefined;

      const customerEmail =
        typeof payment.customer
          ?.email === "string"
          ? payment.customer.email
              .trim()
              .toLowerCase()
          : "";

      const amount = Number(
        payment.amount
      );

      if (
        !Number.isFinite(amount) ||
        amount <= 0
      ) {
        logger.warn(
          `PAYSTACK_WEBHOOK_INVALID_AMOUNT: ${reference}`
        );

        return NextResponse.json(
          {
            error:
              "Invalid payment amount.",
          },
          {
            status: 400,
          }
        );
      }

      const order =
        await OrderService.validateWebhookOrder(
          orderId,
          orderNumber,
          amount,
          customerEmail
        );

      /**
       * ==========================================================
       * ORDER IDEMPOTENCY
       * ==========================================================
       */
      if (order.paymentStatus) {
        logger.info(
          `PAYSTACK_WEBHOOK_ALREADY_PROCESSED: ${order.orderNumber}`
        );

        return NextResponse.json({
          success: true,
          received: true,
          alreadyProcessed: true,
          orderId: order.id,
          orderNumber:
            order.orderNumber,
        });
      }

      /**
       * Complete the order payment.
       */
      const processingFee =
        payment.fees != null
          ? Number(payment.fees) / 100
          : undefined;

      const updatedOrder =
        await OrderService.completePaidOrder(
          order.id,
          reference,
          processingFee
        );

      logger.info(
        `PAYMENT_CONFIRMED: ${updatedOrder.orderNumber}`
      );

      return NextResponse.json({
        success: true,
        received: true,
        orderId: updatedOrder.id,
        orderNumber:
          updatedOrder.orderNumber,
        status:
          updatedOrder.status,
      });
    } catch (error: any) {
      logger.error(
        "PAYSTACK_WEBHOOK_ERROR:",
        error
      );

      return NextResponse.json(
        {
          error:
            error?.message ??
            "Webhook processing failed.",
        },
        {
          status: 500,
        }
      );
    }
  }
);
