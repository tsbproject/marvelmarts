import { Prisma } from "@prisma/client";


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

export type ShipmentNotificationStatus =
  | "SHIPPED"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY";

export interface ShipmentNotificationData {
  orderNumber: string;
  firstName?: string | null;
  email: string | null;
  trackingNumber: string | null;
}

export interface ShipmentStatusNotificationData {
  orderNumber: string;
  firstName?: string | null;
  email: string | null;
  trackingNumber: string | null;
  status: ShipmentNotificationStatus;
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