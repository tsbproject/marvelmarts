export type PaymentFeeFlow =
  | "WALLET_FUNDING"
  | "BOOST_CREDIT";

const LOCAL_RATE = 0.015;
const FIXED_FEE = 100;
const FEE_CAP = 2_000;
const FIXED_FEE_WAIVER_THRESHOLD = 2_500;

export interface PaymentFeeCalculation {
  baseAmount: number;
  processingFee: number;
  grossAmount: number;
}

/**
 * Calculates the expected Paystack Nigeria local transaction fee
 * when the payer bears the processing fee.
 *
 * This is an estimation used before payment initialization.
 * The actual Paystack fee returned during verification remains
 * the authoritative fee for financial reconciliation.
 */
export function calculatePaymentFee(
  baseAmount: number,
  _flow: PaymentFeeFlow
): PaymentFeeCalculation {
  if (!Number.isFinite(baseAmount) || baseAmount <= 0) {
    throw new Error("Payment amount must be greater than zero.");
  }

  const amount = Math.round(baseAmount * 100) / 100;

  /*
   * Paystack's fixed ₦100 component is waived below ₦2,500.
   *
   * For fee-bearing payments, the processor fee is calculated
   * on the gross amount charged to the payer, so the amount
   * must be grossed up rather than simply adding 1.5% + ₦100.
   */
  const fixedFee =
    amount < FIXED_FEE_WAIVER_THRESHOLD ? 0 : FIXED_FEE;

  let grossAmount: number;

  if (fixedFee === 0) {
  grossAmount = amount / (1 - LOCAL_RATE) + 0.01;
    } else {
    grossAmount =
        (amount + fixedFee) / (1 - LOCAL_RATE) + 0.01;
    }

    grossAmount = Math.ceil(grossAmount * 100) / 100;

  let processingFee = grossAmount - amount;

  /*
   * Paystack's local transaction fee is capped at ₦2,000.
   *
   * If gross-up produces a fee above the cap, charge the
   * base amount plus the maximum permitted fee.
   */
  if (processingFee > FEE_CAP) {
    processingFee = FEE_CAP;
    grossAmount = amount + FEE_CAP;
  }

  processingFee = Math.round(processingFee * 100) / 100;
  grossAmount = Math.round(grossAmount * 100) / 100;

  return {
    baseAmount: amount,
    processingFee,
    grossAmount,
  };
}