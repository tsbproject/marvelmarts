import { NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";
import { handleApiError } from "@/app/lib/auth/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories =
      await prisma.category.findMany({
        where: {
          parentId: null,
        },
        orderBy: {
          position: "asc",
        },
        include: {
          children: {
            orderBy: {
              position: "asc",
            },
            include: {
              children: {
                orderBy: {
                  position: "asc",
                },
              },
            },
          },
        },
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