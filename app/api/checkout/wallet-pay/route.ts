import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/lib/auth/guards";
import { handleApiError } from "@/app/lib/auth/api";
import { WalletService } from "@/app/lib/services/wallet.service";



export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest
) {
  try {
    const session =
      await requireAuth();

    const body =
      await req.json();

    const result =
      await WalletService.checkout(
        session.user.id,
        body
      );

    return NextResponse.json(
      result,
      {
        status: 201,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}