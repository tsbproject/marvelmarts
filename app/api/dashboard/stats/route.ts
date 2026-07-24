import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import {
  requireAdmin,
  handleApiError,
} from "@/app/lib/auth/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();

    const [
      users,
      orders,
      tickets,
      blogs,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.ticket.count({
        where: {
          status: "OPEN",
        },
      }),
      prisma.blog.count(),
    ]);

    return NextResponse.json(
      {
        success: true,
        users,
        orders,
        tickets,
        blogs,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}