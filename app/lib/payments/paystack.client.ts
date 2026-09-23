import type { PaymentProvider } from "./payment.interface";


import type {
  PaymentInitializeInput,
  PaymentInitializeResult,
  PaymentVerificationResult,
  PaymentRefundInput,
  PaymentRefundResult,
} from "./payment.types";

export class PaystackClient implements PaymentProvider {
  private getSecretKey(): string {
    const secret = process.env.PAYSTACK_SECRET_KEY;

    if (!secret) {
      throw new Error("PAYSTACK_SECRET_KEY is not configured.");
    }

    return secret;
  }

  async initialize(
    input: PaymentInitializeInput
  ): Promise<PaymentInitializeResult> {
    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.getSecretKey()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: input.email,
          amount: Math.round(input.amount * 100),
          reference: input.reference,
          callback_url: input.callbackUrl,
          metadata: input.metadata,
        }),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.status) {
      throw new Error(
        result.message ?? "Unable to initialize payment."
      );
    }

    return {
      authorizationUrl: result.data.authorization_url,
      accessCode: result.data.access_code,
      reference: result.data.reference,
    };
  }

  async verify(
    reference: string
  ): Promise<PaymentVerificationResult> {
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
      throw new Error("Transaction verification failed.");
    }

    return {
      success: true,
      reference: result.data.reference,
      amount: result.data.amount,
      currency: result.data.currency,
      status: result.data.status,
      gatewayResponse: result.data.gateway_response,
      metadata: result.data.metadata,
      raw: result.data,
    };
  }


  async refund(
    input: PaymentRefundInput
  ): Promise<PaymentRefundResult> {
    if (!input.reference?.trim()) {
      throw new Error(
        "Paystack transaction reference is required for refund."
      );
    }

    if (
      input.amount !== undefined &&
      (!Number.isFinite(input.amount) ||
        input.amount <= 0)
    ) {
      throw new Error(
        "Refund amount must be greater than zero."
      );
    }

    const body: Record<string, unknown> = {
      transaction: input.reference.trim(),
    };

    if (input.amount !== undefined) {
      body.amount = Math.round(input.amount * 100);
    }

    if (input.reason?.trim()) {
      body.customer_note = input.reason.trim();
    }

    const response = await fetch(
      "https://api.paystack.co/refund",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.getSecretKey()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const result = await response.json();

    if (!response.ok || !result.status) {
      throw new Error(
        result.message ?? "Unable to process Paystack refund."
      );
    }

    return {
      success: true,
      reference: input.reference,
      refundReference:
        result.data?.id?.toString() ??
        result.data?.reference ??
        undefined,
      amount:
        Number(result.data?.amount ?? 0) / 100,
      currency:
        result.data?.currency ?? "NGN",
      status:
        result.data?.status ?? "processing",
      message: result.message,
      raw: result.data,
    };
  }
}