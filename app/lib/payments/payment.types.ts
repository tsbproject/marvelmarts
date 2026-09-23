export interface PaymentInitializeInput {
  email: string;
  amount: number; // Naira
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentInitializeResult {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

export interface PaymentVerificationResult {
  success: boolean;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  gatewayResponse?: string;
  metadata?: Record<string, unknown>;
  raw: any;
}


export interface PaymentRefundInput {
  reference: string;
  amount?: number; // Naira; omit for a full refund
  reason?: string;
}

export interface PaymentRefundResult {
  success: boolean;
  reference: string;
  refundReference?: string;
  amount: number;
  currency: string;
  status: string;
  message?: string;
  raw: any;
}