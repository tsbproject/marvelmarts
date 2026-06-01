import { Prisma } from "@prisma/client";


export interface OrderItem {
  title: string;
  qty: number;
  unitPrice: number;
}

export interface OrderConfirmationData {
  orderNumber: string;
   firstName?: string | null;
   email: string | null;
  total: number | Prisma.Decimal;
  items: OrderItem[];
}

export interface ShipmentNotificationData {
  orderNumber: string;
  firstName?: string | null;
  email: string | null;
  trackingNumber: string | null;
}
export interface DeliveryConfirmationData {
  orderNumber: string;

  firstName?: string | null;

  email: string | null;

  city?: string | null;

  streetAddress?: string | null;
}

export interface OrderCancellationData {
  orderNumber: string;
  firstName?: string | null;
  email: string | null;
}

export interface RefundStatusData {
  orderNumber: string;
   firstName?: string | null;
   email: string | null;
  status: "approved" | "rejected";
  reason?: string;
}