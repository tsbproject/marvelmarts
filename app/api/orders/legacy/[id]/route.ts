import { NextResponse } from "next/server";
import { handleApiError } from "@/app/lib/auth/api";
import { badRequest } from "@/app/lib/auth/errors";
import { OrderService } from "@/app/lib/services/order.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      throw badRequest("Order ID is required.");
    }

   const order =
  await OrderService.getOrderStatusById(id);

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    return handleApiError(error);
  }
}