import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const [userCount, orderCount, openTickets, blogCount] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.ticket.count({ where: { status: "OPEN" } }),
      prisma.blog.count(), // This will now work!
    ]);

    return NextResponse.json({
      users: userCount,
      orders: orderCount,
      tickets: openTickets,
      blogs: blogCount,
    });
  } catch (error) {
    console.error("Stats API Error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}