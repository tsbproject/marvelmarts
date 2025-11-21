// app/api/categories/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/_lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: { children: true },
    });

    return NextResponse.json(categories);
  } catch (err: unknown) {
    let message = "Unknown error";
    if (err instanceof Error) message = err.message;

    console.error("GET /api/categories error:", err);
    return NextResponse.json({ message }, { status: 500 });
  }
}
