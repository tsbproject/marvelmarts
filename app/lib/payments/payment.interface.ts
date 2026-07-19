import {
  PaymentInitializeInput,
  PaymentInitializeResult,
  PaymentVerificationResult,
} from "./payment.types";

export interface PaymentProvider {
  initialize(
    input: PaymentInitializeInput
  ): Promise<PaymentInitializeResult>;

  verify(
    reference: string
  ): Promise<PaymentVerificationResult>;
}