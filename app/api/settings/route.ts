import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

// GET settings
export async function GET() {
  const settings = await prisma.settings.findFirst();
  return NextResponse.json(settings);
}

// UPDATE settings
export async function POST(req: Request) {
  const data = await req.json();
  const updated = await prisma.siteSettings.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, ...data },
  });
  return NextResponse.json(updated);
}
