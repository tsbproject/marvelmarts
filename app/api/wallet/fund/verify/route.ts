import { NextResponse } from "next/server";

import {
  requireAuth,
  handleApiError,
} from "@/app/lib/auth/api";

import { badRequest } from "@/app/lib/auth/errors";

import { WalletService } from "@/app/lib/services/wallet.service";
import { verifyOrigin } from "@/app/lib/auth/csrf";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const POST = withApiLogging(
  async (request: Request) => {
    try {
      verifyOrigin(request);

      const session =
        await requireAuth();

      const { reference } =
        await request.json();

      if (!reference) {
        throw badRequest(
          "Payment reference is required."
        );
      }

      const result =
        await WalletService.verifyWalletFunding({
          userId: session.user.id,
          reference,
        });

      return NextResponse.json(result);
        } catch (error) {
          return handleApiError(error);
        }
  }
);