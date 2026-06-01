export interface OrderItem {
  title: string;
  qty: number;
  unitPrice: number;
}

export interface OrderConfirmationData {
  orderNumber: string;
  firstName: string;
   email: string | null;
  total: number;
  items: OrderItem[];
}

export interface ShipmentNotificationData {
  orderNumber: string;
  firstName?: string | null;
  email: string | null;
  trackingNumber?: string;
}
export interface DeliveryConfirmationData {
  orderNumber: string;
  firstName: string;
  email: string | null;
  city: string;
  streetAddress: string;
}

export interface OrderCancellationData {
  orderNumber: string;
  firstName: string;
  email: string | null;
}

export interface RefundStatusData {
  orderNumber: string;
  firstName: string;
   email: string | null;
  status: "approved" | "rejected";
  reason?: string;
}