import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  parentId: z.string().optional(),
  position: z.number().optional(),
});

// 🔹 Create Category
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = categorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, slug, parentId, position } = parsed.data;

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: { name, slug, parentId, position: position ?? 0 },
    });

    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (err) {
    console.error("Category creation error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// 🔹 List Categories
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: { children: true, parent: true },
      orderBy: { position: "asc" },
    });

    return NextResponse.json({ success: true, categories }, { status: 200 });
  } catch (err) {
    console.error("Category fetch error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
