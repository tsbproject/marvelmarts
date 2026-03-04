import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET(request: Request) {
  // Security: Check for a CRON_SECRET so random people can't trigger this
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const now = new Date();

  const result = await prisma.product.updateMany({
    where: {
      boostUntil: { lt: now },
      isTrending: true,
    },
    data: {
      isTrending: false,
    },
  });

  return NextResponse.json({ 
    processed: result.count, 
    timestamp: now.toISOString() 
  });
}