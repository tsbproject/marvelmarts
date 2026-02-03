import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function PATCH(req: Request) {
  try {
    const { ids, approved } = await req.json();

    const result = await prisma.review.updateMany({
      where: {
        id: { in: ids }
      },
      data: { approved }
    });

    return NextResponse.json({ updated: result.count });
  } catch (error) {
    return new NextResponse("Bulk update failed", { status: 500 });
  }
}


export async function DELETE(req: Request) {
  try {
    const { ids } = await req.json();

    // 1. Delete all selected reviews
    await prisma.review.deleteMany({
      where: { id: { in: ids } }
    });

    return new NextResponse("Intel Purged", { status: 200 });
  } catch (error) {
    return new NextResponse("Purge Failed", { status: 500 });
  }
}