import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Zod schema for JSON-based image input
const imageSchema = z.object({
  url: z.string().url("Image URL must be valid"),
  alt: z.string().optional(),
  order: z.number().optional(),
});

// GET /api/products/[slug]/images
export async function GET(
  request: NextRequest,
  context: { params: { slug: string } }
) {
  try {
    const { slug } = context.params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: { images: true },
    });

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product.images);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("GET /api/products/[slug]/images error:", err);
    return NextResponse.json({ message }, { status: 500 });
  }
}

// POST /api/products/[slug]/images
export async function POST(
  request: NextRequest,
  context: { params: { slug: string } }
) {
  try {
    const { slug } = context.params;
    const contentType = request.headers.get("content-type") || "";

    const product = await prisma.product.findUnique({
      where: { slug },
    });

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    // Case 1: JSON body (API clients)
    if (contentType.includes("application/json")) {
      const body = await request.json();
      const parsed = imageSchema.parse(body);

      const image = await prisma.productImage.create({
        data: {
          url: parsed.url,
          alt: parsed.alt,
          order: parsed.order ?? 0,
          productId: product.id,
        },
      });

      return NextResponse.json(image, { status: 201 });
    }

    // Case 2: FormData (file uploads from dashboard)
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();

      const mainImage = formData.get("mainImage") as File | null;
      const extraImages = formData.getAll("extraImages") as File[];

      const createdImages = [];

      if (mainImage) {
        // TODO: upload to S3/Cloudinary and get URL
        const url = `https://cdn.example.com/${slug}/${mainImage.name}`;
        const img = await prisma.productImage.create({
          data: {
            url,
            alt: "Main image",
            order: 0,
            productId: product.id,
          },
        });
        createdImages.push(img);
      }

      for (let i = 0; i < extraImages.length; i++) {
        const file = extraImages[i];
        const url = `https://cdn.example.com/${slug}/${file.name}`;
        const img = await prisma.productImage.create({
          data: {
            url,
            alt: `Extra image ${i + 1}`,
            order: i + 1,
            productId: product.id,
          },
        });
        createdImages.push(img);
      }

      return NextResponse.json(createdImages, { status: 201 });
    }

    return NextResponse.json({ message: "Unsupported content type" }, { status: 400 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ errors: err.flatten() }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("POST /api/products/[slug]/images error:", err);
    return NextResponse.json({ message }, { status: 500 });
  }
}

// DELETE /api/products/[slug]/images?id=IMAGE_ID
export async function DELETE(
  request: NextRequest,
  context: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get("id");

    if (!imageId) {
      return NextResponse.json({ message: "Image ID required" }, { status: 400 });
    }

    await prisma.productImage.delete({
      where: { id: imageId },
    });

    return NextResponse.json({ message: "Image deleted successfully" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("DELETE /api/products/[slug]/images error:", err);
    return NextResponse.json({ message }, { status: 500 });
  }
}
