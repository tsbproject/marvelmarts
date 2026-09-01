import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  requireAuth,
  handleApiError,
} from "@/app/lib/auth/api";

import { verifyOrigin } from "@/app/lib/auth/csrf";

import { AuthAccountService } from "@/app/lib/services/auth-account.service";

import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    provider: string;
  }>;
};

export const DELETE = withApiLogging(
  async (
    req: NextRequest,
    context: RouteContext
  ) => {
    try {
      verifyOrigin(req);

      const session = await requireAuth();

      const { provider } =
        await context.params;

      const result =
        await AuthAccountService.unlinkAccount(
          session.user.id,
          provider
        );

      return NextResponse.json(result);
    } catch (error) {
      return handleApiError(error);
    }
  }
);