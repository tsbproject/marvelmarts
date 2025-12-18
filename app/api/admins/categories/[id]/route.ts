import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  parentId: z.string().optional(),
  position: z.number().optional(),
});

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    // Optional: check slug conflict if slug is being updated
    if (parsed.data.slug) {
      const existing = await prisma.category.findUnique({ where: { slug: parsed.data.slug } });
      if (existing && existing.id !== params.id) {
        return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
      }
    }

    const category = await prisma.category.update({
      where: { id: params.id },
      data: parsed.data,
    });

    return NextResponse.json({ success: true, category }, { status: 200 });
  } catch (err) {
    console.error("Category update error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}



// 🔹 Delete Category
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.category.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Category delete error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
