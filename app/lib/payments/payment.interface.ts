import {
  PaymentInitializeInput,
  PaymentInitializeResult,
  PaymentVerificationResult,
  PaymentRefundInput,
  PaymentRefundResult,
} from "./payment.types";

export interface PaymentProvider {
  initialize(
    input: PaymentInitializeInput
  ): Promise<PaymentInitializeResult>;

  verify(
    reference: string
  ): Promise<PaymentVerificationResult>;


    refund(
    input: PaymentRefundInput
  ): Promise<PaymentRefundResult>;
}