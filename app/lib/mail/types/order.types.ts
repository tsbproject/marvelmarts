export interface OrderItem {
  title: string;
  qty: number;
  unitPrice: number;
}

export interface OrderConfirmationData {
  orderNumber: string;
  firstName: string;
  email: string;
  total: number;
  items: OrderItem[];
}

export interface ShipmentNotificationData {
  orderNumber: string;
  firstName: string;
  email: string;
  trackingNumber?: string;
}

export interface DeliveryConfirmationData {
  orderNumber: string;
  firstName: string;
  email: string;
  city: string;
  streetAddress: string;
}

export interface OrderCancellationData {
  orderNumber: string;
  firstName: string;
  email: string;
}

export interface RefundStatusData {
  orderNumber: string;
  firstName: string;
  email: string;
  status: "approved" | "rejected";
  reason?: string;
}