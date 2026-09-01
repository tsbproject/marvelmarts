import { NextResponse } from "next/server";
import { requireAuth, handleApiError } from "@/app/lib/auth/api";
import { AuthAccountService } from "@/app/lib/services/auth-account.service";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApiLogging(
  async () => {
    try {
      const session = await requireAuth();

      const accounts =
        await AuthAccountService.getLinkedAccounts(
          session.user.id
        );

      return NextResponse.json({
        success: true,
        accounts,
      });
    } catch (error) {
      return handleApiError(error);
    }
  }
);