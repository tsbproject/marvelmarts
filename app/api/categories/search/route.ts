import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";

import { handleApiError } from "@/app/lib/auth/api";
import { badRequest } from "@/app/lib/auth/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest
) {
  try {
    const query =
      req.nextUrl.searchParams.get("q")
        ?.trim();

    if (!query) {
      throw badRequest(
        "Search query is required."
      );
    }

    if (query.length < 3) {
      return NextResponse.json(
        {
          success: true,
          categories: [],
        },
        {
          status: 200,
        }
      );
    }

    const categories =
      await prisma.category.findMany({
        where: {
          OR: [
            {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              slug: {
                contains: query,
                mode: "insensitive",
              },
            },
          ],
        },
        select: {
          id: true,
          name: true,
          slug: true,
        },
        take: 6,
      });

    return NextResponse.json(
      {
        success: true,
        categories,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}