import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { Prisma, ProductStatus } from "@prisma/client";
import { z } from "zod";
import { uploadToCloudinary } from "@/app/lib/cloudinary";
import { deleteFromCloudinary } from "@/app/lib/cloudinary";
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
    const slug = `${data.title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "")}-${Date.now()}`;

    const imageUrls: string[] = [];
    for (const [key, value] of formData.entries()) {
      if (value instanceof File && (key === "mainImage" || key === "extraImages") && value.size > 0) {
        // Line 57: Fixed folder argument
        const url = await uploadToCloudinary(value, "products") as string;
        imageUrls.push(url);
      }
    }

    const productData: Prisma.ProductCreateInput = {
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
      tags: [], 
      rating: 0,
      ratingCount: 0,
      isFeatured: data.isFeatured ?? false,
      isPublished: true,
      vendor: { connect: { id: session.user.id } },
      category: data.categoryId ? { connect: { id: data.categoryId } } : undefined,
      images: {
        create: imageUrls.map((url, index) => ({
          url,
          order: index,
          alt: data.title,
        })),
      },
    };

    const product = await prisma.product.create({
      data: productData,
      include: { images: true, category: true },
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
    formData.forEach((val, key) => { 
      if (!(val instanceof File)) fields[key] = val; 
    });

    const parsed = productSchema.safeParse(fields);
    if (!parsed.success) return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    const data = parsed.data;

    const existingProduct = await prisma.product.findUnique({ where: { id }, select: { vendorId: true } });
    if (!existingProduct || existingProduct.vendorId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const mainImageFile = formData.get("mainImage") as File | null;
    const extraImageFiles = formData.getAll("extraImages") as File[];
    const imageOperations: any[] = [];

    // Line 158: Fixed Cloudinary call
    if (mainImageFile && mainImageFile.size > 0) {
      const mainImageUrl = await uploadToCloudinary(mainImageFile, "products");
      imageOperations.push({ url: mainImageUrl, order: 0, alt: data.title });
    }

    // Line 167: Fixed Cloudinary call
    if (extraImageFiles.length > 0) {
      for (const file of extraImageFiles) {
        if (file instanceof File && file.size > 0) {
          const url = await uploadToCloudinary(file, "products");
          imageOperations.push({ url, order: 1, alt: data.title });
        }
      }
    }

    const updated = await prisma.product.update({
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
      },
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
        },
      });
      if (!product) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
      return NextResponse.json({ success: true, product: { ...product, price: Number(product.price), discountPrice: product.discountPrice ? Number(product.discountPrice) : null } });
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

/* ===========================
   DELETE /api/products
=========================== */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || !session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 1. Find the product and all associated images before deleting
    const product = await prisma.product.findUnique({ 
      where: { id }, 
      include: { images: true } 
    });

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    // 2. Verify Ownership
    if (product.vendorId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // 3. Delete from Cloudinary first
    // We do this before the DB deletion to ensure we have the URLs
    if (product.images.length > 0) {
      const deletePromises = product.images.map((img) => deleteFromCloudinary(img.url));
      await Promise.all(deletePromises);
    }

    // 4. Delete from Database (using transaction to clean up relations)
    await prisma.$transaction([
      prisma.productImage.deleteMany({ where: { productId: id } }),
      prisma.variant.deleteMany({ where: { productId: id } }),
      prisma.product.delete({ where: { id } }),
    ]);

    return NextResponse.json({ success: true, message: "Product and images deleted successfully" });
  } catch (err) {
    console.error("DELETE Error:", err);
    return NextResponse.json({ success: false, message: "Delete failed" }, { status: 500 });
  }
}