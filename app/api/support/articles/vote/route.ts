import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { id, type } = await req.json();

  if (!id || !["helpful", "notHelpful"].includes(type)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const updated = await prisma.helpArticle.update({
    where: { id },
    data: {
      [type]: { increment: 1 }
    }
  });

  return NextResponse.json({ success: true, count: updated[type as "helpful" | "notHelpful"] });
}