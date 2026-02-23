import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // This bypasses Studio and asks the DB directly
    const totalOrders = await prisma.order.count();
    const sampleOrder = await prisma.order.findFirst();
    const tables = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema='public'`;

    return NextResponse.json({ 
      count: totalOrders, 
      sample: sampleOrder,
      existingTables: tables 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}