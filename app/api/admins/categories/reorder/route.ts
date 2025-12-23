import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma"; // adjust import if your prisma client lives elsewhere

export async function PUT(req: NextRequest) {
  try {
    const updates = await req.json(); // [{ id, position }, ...]

    // ✅ Update each category's position
    for (const { id, position } of updates) {
      await prisma.category.update({
        where: { id },
        data: { position },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to reorder categories:", error);
    return NextResponse.json(
      { error: "Failed to reorder categories" },
      { status: 500 }
    );
  }
}
