import type { PaymentProvider } from "./payment.interface";
import type {
  PaymentInitializeInput,
  PaymentInitializeResult,
  PaymentVerificationResult,
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
}