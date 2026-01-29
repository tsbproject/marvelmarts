import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { Prisma, ProductStatus } from "@prisma/client";
import { z } from "zod";
import { uploadToCloudinary, deleteFromCloudinary } from "@/app/lib/cloudinary";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ===========================
   Zod Schema
=========================== */
const productSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  brand: z.string().optional().nullable(),
  price: z.coerce.number().positive(),
  discountPrice: z.coerce.number().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  status: z.nativeEnum(ProductStatus).default(ProductStatus.ACTIVE),
  stock: z.coerce.number().int().default(0),
  sku: z.string().trim().optional().nullable(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  isFeatured: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional(),
  shippingMethod: z.string().optional(),
  weight: z.coerce.number().optional(),
});

/* ===========================
   POST: Create Product
=========================== */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const fields: Record<string, any> = {};
    formData.forEach((val, key) => { if (!(val instanceof File)) fields[key] = val; });

    const parsed = productSchema.safeParse(fields);
    if (!parsed.success) return NextResponse.json({ success: false, errors: parsed.error.flatten().fieldErrors }, { status: 400 });

    const data = parsed.data;
    const variants = JSON.parse((formData.get("variants") as string) || "[]");
    const slug = `${data.title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "")}-${Date.now()}`;

    // Handle Images
    const imageUrls: string[] = [];
    for (const [key, value] of formData.entries()) {
      if (value instanceof File && (key === "mainImage" || key === "extraImages") && value.size > 0) {
        const url = await uploadToCloudinary(value, "products") as string;
        imageUrls.push(url);
      }
    }

    const product = await prisma.$transaction(async (tx) => {
      return await tx.product.create({
        data: {
          title: data.title,
          slug: slug,
          sku: data.sku || null,
          description: data.description,
          brand: data.brand || null,
          price: new Prisma.Decimal(data.price),
          discountPrice: data.discountPrice ? new Prisma.Decimal(data.discountPrice) : null,
          stock: data.stock,
          status: data.status,
          metaTitle: data.metaTitle || null,
          metaDescription: data.metaDescription || null,
          isFeatured: data.isFeatured ?? false,
          vendor: { connect: { id: session.user.id } },
          category: data.categoryId ? { connect: { id: data.categoryId } } : undefined,
          images: {
            create: imageUrls.map((url, index) => ({
              url,
              order: index,
              alt: data.title,
            })),
          },
          variants: {
            create: variants.map((v: any) => ({
              name: v.name,
              sku: v.sku,
              price: v.price ? new Prisma.Decimal(v.price) : null,
              stock: v.stock || 0,
              attributes: { name: v.name } // Storing name in Json attributes
            }))
          }
        },
        include: { images: true, category: true, variants: true },
      });
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (err) {
    console.error("POST Error:", err);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

/* ===========================
   PUT: Update Product
=========================== */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || !session?.user) return NextResponse.json({ message: "Auth required" }, { status: 401 });

    const formData = await request.formData();
    const fields: Record<string, any> = {};
    formData.forEach((val, key) => { if (!(val instanceof File)) fields[key] = val; });

    const parsed = productSchema.safeParse(fields);
    if (!parsed.success) return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    
    const data = parsed.data;
    const variants = JSON.parse((formData.get("variants") as string) || "[]");
    const deletedImageIds = JSON.parse((formData.get("deletedImageIds") as string) || "[]");

    const existingProduct = await prisma.product.findUnique({ where: { id }, select: { vendorId: true } });
    if (!existingProduct || existingProduct.vendorId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Handle New Images
    const imageOperations: any[] = [];
    for (const [key, value] of formData.entries()) {
      if (value instanceof File && (key === "mainImage" || key === "extraImages") && value.size > 0) {
        const url = await uploadToCloudinary(value, "products");
        imageOperations.push({ url, order: key === "mainImage" ? 0 : 1, alt: data.title });
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Delete images marked for removal
      if (deletedImageIds.length > 0) {
        await tx.productImage.deleteMany({ where: { id: { in: deletedImageIds } } });
      }

      // 2. Clear old variants to re-sync (Simplest way to sync dynamic arrays)
      await tx.variant.deleteMany({ where: { productId: id } });

      // 3. Update Product and Create New Variants/Images
      return await tx.product.update({
        where: { id },
        data: {
          title: data.title,
          sku: data.sku || null,
          description: data.description,
          brand: data.brand || null,
          price: new Prisma.Decimal(data.price),
          discountPrice: data.discountPrice ? new Prisma.Decimal(data.discountPrice) : null,
          stock: data.stock,
          status: data.status,
          metaTitle: data.metaTitle || null,
          metaDescription: data.metaDescription || null,
          isFeatured: data.isFeatured,
          category: data.categoryId ? { connect: { id: data.categoryId } } : { disconnect: true },
          images: imageOperations.length > 0 ? { create: imageOperations } : undefined,
          variants: {
            create: variants.map((v: any) => ({
              name: v.name,
              sku: v.sku,
              price: v.price ? new Prisma.Decimal(v.price) : null,
              stock: v.stock || 0,
              attributes: { name: v.name }
            }))
          }
        },
        include: { images: true, variants: true }
      });
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (err) {
    console.error("PUT Error:", err);
    return NextResponse.json({ success: false, message: "Update failed" }, { status: 500 });
  }
}

/* ===========================
   GET & DELETE (Maintained)
=========================== */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const viewOwn = searchParams.get("own") === "true";

    if (id) {
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          category: { select: { id: true, name: true } },
          images: { orderBy: { order: "asc" } },
          variants: true,
        },
      });
      if (!product) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
      
      return NextResponse.json({ 
        success: true, 
        product: { 
          ...product, 
          price: Number(product.price), 
          discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
          variants: product.variants.map(v => ({ ...v, price: v.price ? Number(v.price) : null }))
        } 
      });
    }

    const items = await prisma.product.findMany({
      where: { vendorId: viewOwn ? session?.user?.id : undefined, status: viewOwn ? undefined : "ACTIVE" },
      orderBy: { createdAt: "desc" },
      include: { category: { select: { id: true, name: true } }, images: { orderBy: { order: "asc" } } },
    });

    return NextResponse.json({ success: true, items: items.map(p => ({ ...p, price: Number(p.price), discountPrice: p.discountPrice ? Number(p.discountPrice) : null })) });
  } catch (err) {
    return NextResponse.json({ success: false, message: "Fetch failed" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || !session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const product = await prisma.product.findUnique({ where: { id }, include: { images: true } });
    if (!product) return NextResponse.json({ message: "Product not found" }, { status: 404 });

    if (product.vendorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    if (product.images.length > 0) {
      await Promise.all(product.images.map((img) => deleteFromCloudinary(img.url)));
    }

    await prisma.$transaction([
      prisma.productImage.deleteMany({ where: { productId: id } }),
      prisma.variant.deleteMany({ where: { productId: id } }),
      prisma.product.delete({ where: { id } }),
    ]);

    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (err) {
    return NextResponse.json({ success: false, message: "Delete failed" }, { status: 500 });
  }
}