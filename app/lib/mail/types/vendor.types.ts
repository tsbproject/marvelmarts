export interface VendorApprovalData {
  email: string;
  firstName: string;
  storeName: string;
  
}


export interface VendorSetupCompleteData {
  email: string;
  firstName: string;
  storeName: string;
}

export interface VendorReviewData {
  email: string;
  firstName: string;
  storeName: string;
}

export interface VendorActionData {
  email: string;
  name: string;
  action:
    | "SUSPEND"
    | "RESTORE";

  reason: string;
}

export interface VendorCreditPurchaseData {
  email: string;
  firstName: string;
  storeName: string;
  amountAdded: number;
  newBalance: number;
}

export interface VendorLowCreditData {
  email: string;
  firstName: string;
  storeName: string;
  currentBalance: number;
}

export interface VendorExhaustedCreditData {
  email: string;
  firstName: string;
  storeName: string;
}


export interface VendorStatusData {
  email: string;
  firstName: string;
  storeName: string;
  status:
    | "APPROVED"
    | "REJECTED"
    | "SUSPENDED"
    | "UNDER_REVIEW";

  reason?: string;
}


export interface VendorSetupCompleteData {
  email: string;
  firstName: string;
  storeName: string;
}