import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";

import { handleApiError } from "@/app/lib/auth/api";
import { unauthorized } from "@/app/lib/auth/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest
) {
  try {
    const authHeader =
      req.headers.get(
        "authorization"
      );

    if (
      authHeader !==
      `Bearer ${process.env.CRON_SECRET}`
    ) {
      throw unauthorized("Please log in first.");
    }

    const now = new Date();

    const result =
      await prisma.product.updateMany({
        where: {
          boostUntil: {
            lt: now,
          },
          isTrending: true,
        },
        data: {
          isTrending: false,
        },
      });

    return NextResponse.json(
      {
        success: true,
        processed:
          result.count,
        timestamp:
          now.toISOString(),
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}