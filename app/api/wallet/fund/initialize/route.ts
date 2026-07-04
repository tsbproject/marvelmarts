import { NextResponse } from "next/server";

import { requireAuth, handleApiError } from "@/app/lib/auth/api";
import { PaymentService } from "@/app/lib/services/payment.service";

export async function POST(request: Request) {
  try {
    const session = await requireAuth();

const { amount } = await request.json();

const payment =
  await PaymentService.initializeWalletFunding({
    email: session.user.email!,
    userId: session.user.id,
    amount,
  });

return NextResponse.json({
  success: true,
  ...payment,
});
  } catch (error) {
    return handleApiError(error);
  }
}