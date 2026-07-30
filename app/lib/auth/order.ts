import { UserRole } from "@prisma/client";

import prisma from "@/app/lib/prisma";

import {
  requireAuth,
} from "./api";
import {
  forbidden,
  notFound,
} from "./errors";

export async function requireOrderAccess(
  orderId: string
) {
  const session = await requireAuth();

  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
    select: {
      id: true,
      userId: true,
      vendorProfile: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!order) {
    throw notFound("Order not found.");
  }

  const role = session.user.role as UserRole;

  // Admins can access any order.
  if (
    role === UserRole.ADMIN ||
    role === UserRole.SUPER_ADMIN
  ) {
    return {
      session,
      order,
    };
  }

  // Customer can access only their own orders.
  if (
    role === UserRole.CUSTOMER &&
    order.userId === session.user.id
  ) {
    return {
      session,
      order,
    };
  }

  // Vendor can access only their own orders.
  if (
    role === UserRole.VENDOR &&
    order.vendorProfile?.userId === session.user.id
  ) {
    return {
      session,
      order,
    };
  }

  throw forbidden(
    "You do not have permission to access this order."
  );
}