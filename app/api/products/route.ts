// app/api/products/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/app/_lib/prisma";
import type { ProductUpdate } from "@/types/product"; // Make sure this type includes categoryId

// GET /api/products
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        images: true,
        category: true,
        variants: true,
        reviews: true,
      },
    });

    // Convert decimals for frontend
    const safeProducts = products.map(p => ({
      ...p,
      price: Number(p.price),
      discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
      variants: p.variants.map(v => ({ ...v, price: Number(v.price) })),
    }));

    return NextResponse.json(safeProducts);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("GET /api/products error:", err);
    return NextResponse.json({ message }, { status: 500 });
  }
}

// POST /api/products
export async function POST(request: Request) {
  try {
    const data: ProductUpdate = await request.json();

    // Ensure a slug is created from the title
    const slug = data.title
      ? data.title
          .toLowerCase()                    // Convert to lowercase
          .replace(/\s+/g, "-")              // Replace spaces with hyphens
          .replace(/[^\w-]+/g, "")           // Remove non-alphanumeric characters
      : "";

    const product = await prisma.product.create({
      data: {
        title: data.title!,
        slug: slug, // Use the generated slug
        description: data.description || "",
        price: data.price!,
        discountPrice: data.discountPrice ?? null,
        categoryId: data.categoryId!, // Ensure categoryId is passed
        images: data.images ? { create: data.images.map((url) => ({ url })) } : undefined,
        variants: data.variants
          ? {
              create: data.variants.map((v: string | { name: string; sku: string; price: number }) =>
                typeof v === "string"
                  ? {
                      name: v,
                      sku: "", // Provide a default or generate SKU as needed
                      price: 0 // Provide a default price or handle accordingly
                    }
                  : {
                      name: v.name,
                      sku: v.sku,
                      price: v.price
                    }
              )
            }
          : undefined,
      },
      include: { images: true, category: true, variants: true },
    });

    // Convert decimals for frontend
    const safeProduct = {
      ...product,
      price: Number(product.price),
      discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
      variants: product.variants.map(v => ({ ...v, price: Number(v.price) })),
    };

    return NextResponse.json(safeProduct, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("POST /api/products error:", err);
    return NextResponse.json({ message }, { status: 500 });
  }
}
