// app/api/categories/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { parentId: null }, // only top-level
      orderBy: { position: "asc" },
      include: {
        children: {
          orderBy: { position: "asc" },
          include: {
            children: true, // nested grandchildren
          },
        },
      },
    });

    return NextResponse.json(categories);
  } catch (err) {
    console.error("GET /api/categories error:", err);
    return NextResponse.json({ message: "Failed to fetch categories" }, { status: 500 });
  }
}

