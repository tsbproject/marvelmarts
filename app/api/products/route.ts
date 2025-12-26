import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { productSchema } from "@/app/lib/validations/product";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ProductInput = z.infer<typeof productSchema>;

// GET /api/products
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const categorySlug = searchParams.get("category") ?? undefined;
    const status = searchParams.get("status") as Prisma.ProductWhereInput["status"];
    const q = searchParams.get("q") ?? undefined;
    const page = Number(searchParams.get("page") ?? 1);
    const pageSize = Number(searchParams.get("pageSize") ?? 10);

    const where: Prisma.ProductWhereInput = {
      status,
      category: categorySlug ? { slug: categorySlug } : undefined,
      OR: q
        ? [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ]
        : undefined,
    };

    const total = await prisma.product.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(Math.max(page, 1), totalPages);

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (safePage - 1) * pageSize,
      take: pageSize,
      include: {
        images: true,
        category: true,
        variants: true,
        reviews: true,
      },
    });

    const safeProducts = products.map((p) => ({
      ...p,
      price: Number(p.price),
      discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
      variants: p.variants.map((v) => ({
        ...v,
        price: v.price ? Number(v.price) : null,
      })),
    }));

    return NextResponse.json({
      items: safeProducts,
      total,
      page: safePage,
      pageSize,
      totalPages,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("GET /api/products error:", err);
    return NextResponse.json({ message }, { status: 500 });
  }
}

// POST /api/products
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed: ProductInput = productSchema.parse(body);

    const slug = parsed.title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");

    const product = await prisma.product.create({
      data: {
        title: parsed.title,
        slug,
        description: parsed.description ?? "",
        brand: parsed.brand,
        price: parsed.price,
        discountPrice: parsed.discountPrice,
        categoryId: parsed.categoryId,
        images: parsed.images
          ? { create: parsed.images.map((url) => ({ url })) }
          : undefined,
        variants: parsed.variants ? { create: parsed.variants } : undefined,
        status: parsed.status ?? "ACTIVE",
        isFeatured: parsed.isFeatured ?? false,
        isPublished: parsed.isPublished ?? true,
        metaTitle: parsed.metaTitle,
        metaDescription: parsed.metaDescription,
      },
      include: { images: true, category: true, variants: true },
    });

    const safeProduct = {
      ...product,
      price: Number(product.price),
      discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
      variants: product.variants.map((v) => ({
        ...v,
        price: v.price ? Number(v.price) : null,
      })),
    };

    return NextResponse.json(safeProduct, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ errors: err.flatten() }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("POST /api/products error:", err);
    return NextResponse.json({ message }, { status: 500 });
  }
}
