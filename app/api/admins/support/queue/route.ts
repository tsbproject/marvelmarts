import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const openTickets = await prisma.conversation.count({
    where: { updatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } // Active in last 24h
  });
  return NextResponse.json({ openTickets });
}