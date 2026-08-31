import { NextResponse } from "next/server";

import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET =
  withApiLogging(
    async (_request, _context) => {
      return NextResponse.json(
        {
          success: true,
          status: "ok",
          timestamp:
            new Date().toISOString(),
        },
        {
          status: 200,
        }
      );
    }
  );