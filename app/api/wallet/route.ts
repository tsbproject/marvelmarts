import {
  requireAuth,
  handleApiError,
} from "@/app/lib/auth/api";

import { NextResponse } from "next/server";

import { WalletService } from "@/app/lib/services/wallet.service";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const GET = withApiLogging(
  async () => {
    try {
      const session =
        await requireAuth();

      const balance =
        await WalletService.getBalance(
          session.user.id
        );

      return NextResponse.json({
        success: true,
        balance,
      });
    } catch (error) {
      return handleApiError(error);
    }
  }
);