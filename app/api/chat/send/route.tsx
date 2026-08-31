import { NextRequest, NextResponse } from "next/server";

import { getServerSession } from "next-auth";

import { authOptions } from "@/app/lib/auth";

import { ConversationDomainService } from "@/app/lib/services/conversation-domain.service";

import { handleApiError } from "@/app/lib/auth/api";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = withApiLogging(
  async (req: NextRequest) => {
    try {
      const session =
        await getServerSession(
          authOptions
        );

      const body =
        await req.json();

      const result =
        await ConversationDomainService.sendCustomerMessage(
          session,
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
);