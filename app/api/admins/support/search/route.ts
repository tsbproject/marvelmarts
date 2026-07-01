import { NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";

import { handleApiError } from "@/app/lib/auth/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const query =
      searchParams.get("q")?.trim();

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        articles: [],
      });
    }

    const articles =
      await prisma.helpArticle.findMany({
        where: {
          OR: [
            {
              title: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              content: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              keywords: {
                has: query.toLowerCase(),
              },
            },
          ],
        },
        take: 5,
        orderBy: {
          title: "asc",
        },
      });

    return NextResponse.json({
      success: true,
      articles,
    });

  } catch (error) {
    return handleApiError(error);
  }
}