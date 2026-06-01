export interface AdminAlertData {
  type:
    | "DISPUTE"
    | "VENDOR_SIGNUP"
    | "REPORT";

  subject: string;
  details: string;
}

export interface AdminOrderData {
  orderNumber: string;
  total: number;
  paymentMethod?: string;

  customerName: string;
  customerEmail: string;

  city?: string;
  state?: string;

  items: {
    title: string;
    qty: number;
    unitPrice: number;
  }[];
}