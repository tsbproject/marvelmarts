import { NextRequest, NextResponse } from "next/server";
import { handleApiError } from "@/app/lib/auth/api";
import { ProductService } from "@/app/lib/services/product.service";
import { requireCronAuth } from "@/app/lib/auth/cron";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest
) {
  try {
    requireCronAuth(req);

  const result =
  await ProductService.expireBoostedProducts();

return NextResponse.json(
  {
    success: true,
    processed: result.processed,
    timestamp:
      result.timestamp.toISOString(),
  },
  {
    status: 200,
  }
);
  } catch (error) {
    return handleApiError(error);
  }
}