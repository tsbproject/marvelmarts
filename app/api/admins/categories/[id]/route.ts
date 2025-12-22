// app/api/admins/categories/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  parentId: z.string().optional(),
  position: z.number().optional(),
});

// 🔹 GET handler
export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  if (!id) {
    return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
  }

  const category = await prisma.category.findUnique({
    where: { id },
    include: { parent: true, children: true },
  });

  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, category }, { status: 200 });
}

  // 🔹 PUT handler
export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  if (!id) {
    return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const normalizedData = {
      ...data,
      parentId: data.parentId && data.parentId !== "" ? data.parentId : null,
      position: data.position ?? 0,
    };

    const existingCategory = await prisma.category.findUnique({ where: { id } });
    if (!existingCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    if (normalizedData.slug) {
      const slugConflict = await prisma.category.findUnique({
        where: { slug: normalizedData.slug },
      });
      if (slugConflict && slugConflict.id !== id) {
        return NextResponse.json({ error: "Slug already exists" }, { status: 400 });
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: normalizedData,
    });

    return NextResponse.json({ success: true, category }, { status: 200 });
  } catch (err: any) {
    console.error("Category update error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}

// 🔹 DELETE handler
export async function DELETE(
  _req: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  if (!id) {
    return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
  }

  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  await prisma.category.delete({ where: { id } });

  return NextResponse.json({ success: true }, { status: 200 });
}
