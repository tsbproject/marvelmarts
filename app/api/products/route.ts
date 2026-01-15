import { NextResponse } from "next/server";
import  { prisma } from "@/app/lib/prisma";
import { Prisma } from "@prisma/client";
import path from "path";
import fs from "fs";
import { z } from "zod";
import { ProductStatus } from "@prisma/client";
import { uploadToCloudinary } from "@/app/lib/cloudinary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ===========================
   Zod schema for product creation & update
=========================== */
const productSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  brand: z.string().optional(),
  price: z.coerce.number().positive("Price must be positive"),
  discountPrice: z.coerce.number().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  status: z.nativeEnum(ProductStatus).default(ProductStatus.ACTIVE),
  stock: z.coerce.number().default(0),
  sku: z
    .string()
    .trim()
    .transform((val) => (val === "" ? undefined : val))
    .optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

type ProductFormFields = z.infer<typeof productSchema>;

/* ===========================
   POST /api/products
   Create product
=========================== */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const fields: Record<string, any> = {};
    formData.forEach((value, key) => {
      fields[key] = value;
    });

    const parsed = productSchema.safeParse(fields);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data: ProductFormFields = parsed.data;

    const slug = data.title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");

    // Handle file uploads

    const imageUrls: string[] = [];

for (const [key, value] of formData.entries()) {
  if (value instanceof File && (key === "mainImage" || key === "extraImages")) {
    try {
      const url = await uploadToCloudinary(value, "products") as string;
      imageUrls.push(url);
    } catch (uploadError) {
      console.error("Cloudinary Upload Error:", uploadError);
      // Handle upload failure (maybe continue or throw error)
    }
  }
}
   
    interface ProductImage {
      url: string;
      order: number;
      alt: string;
    }

    interface UploadedImage {
      url: string;
      order: number;
    }

    const uploadedImages: UploadedImage[] = imageUrls.map((url, index) => ({
      url,
      order: index,
    }));

    const productData: Prisma.ProductCreateInput = {
      title: data.title,
      description: data.description, // HTML from Tiptap
      brand: data.brand,
      price: new Prisma.Decimal(data.price),
      discountPrice: data.discountPrice != null ? new Prisma.Decimal(data.discountPrice) : null,
      status: data.status,
      stock: data.stock,
      slug,
      sku: data.sku || undefined,
      metaTitle: data.metaTitle || undefined,
      metaDescription: data.metaDescription || undefined,
      category: data.categoryId ? { connect: { id: data.categoryId } } : undefined,
      
      // Map the Cloudinary URLs to your ProductImage model
      images: uploadedImages.length > 0 ? {
        create: uploadedImages.map((img: UploadedImage): ProductImage => ({
          url: img.url,
          order: img.order,
          alt: data.title // Default alt text to product title
        }))
      } : undefined,
    };

    const product = await prisma.product.create({
      data: productData,
      include: { images: true, category: true },
    });

    return NextResponse.json(
      { success: true, message: "Product created successfully", product },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/products error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

/* ===========================
   GET /api/products
   List products
=========================== */

   // 1. Update Schema to include the 'type' filter
const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  category: z.string().optional(),
  // Added 'type' to sieve products for the homepage
  type: z.enum(["new", "flash", "featured"]).optional(), 
  status: z
    .string()
    .transform((val) => val.toUpperCase())
    .pipe(z.nativeEnum(ProductStatus))
    .optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const parsed = listQuerySchema.safeParse({
      page: searchParams.get("page") || undefined,
      pageSize: searchParams.get("pageSize") || undefined,
      search: searchParams.get("search") || undefined,
      category: searchParams.get("category") || undefined,
      status: searchParams.get("status") || undefined,
      type: searchParams.get("type") || undefined, // Parse the type
    });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { page, pageSize, search, category, status, type } = parsed.data;

    // 2. Build Enhanced Prisma Filter
    const where: Prisma.ProductWhereInput = {
      // If we are on the homepage (type is provided), we usually only want ACTIVE products
      status: type ? "ACTIVE" : ((status as any) ?? undefined),
      category: category ? { slug: category } : undefined,
      OR: search
        ? [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ]
        : undefined,
    };

    // --- SIEVING LOGIC START ---
    if (type === "flash") {
      // Flash Sales: Must be featured AND have a discount
      where.isFeatured = true;
      where.discountPrice = { gt: 0 }; 
    } else if (type === "featured") {
      // Featured: Just the flag
      where.isFeatured = true;
    } 
    // Note: 'new' doesn't need a filter here because we already orderBy createdAt desc
    // --- SIEVING LOGIC END ---

    const total = await prisma.product.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(Math.max(page, 1), totalPages);

    const items = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" }, // New Arrivals handled by default sort
      skip: (safePage - 1) * pageSize,
      take: pageSize,
      include: {
        category: { select: { name: true } },
        images: { orderBy: { order: "asc" } },
      },
    });

    // 5. Data Normalization (Maintains your existing style)
    const normalizedItems = items.map((p) => {
      const hasImages = p.images && p.images.length > 0;
      const mainImageUrl = hasImages 
        ? p.images[0].url 
        : `https://placehold.co/600x400?text=${encodeURIComponent(p.title)}`;

      return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        description: p.description || "",
        price: Number(p.price),
        discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
        status: p.status,
        isFeatured: p.isFeatured || false,
        stock: p.stock || 0,
        category: p.category ? { name: p.category.name } : { name: "Uncategorized" },
        images: hasImages ? p.images : [],
        imageUrl: mainImageUrl,
        createdAt: p.createdAt, // Needed for "New" badge checks
      };
    });

    return NextResponse.json({
      success: true,
      items: normalizedItems,
      total,
      page: safePage,
      pageSize,
      totalPages,
    });
  } catch (err) {
    console.error("CRITICAL: GET /api/products error:", err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}

/* ===========================
   PUT /api/products?id=PRODUCT_ID
   Update product
=========================== */
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "ID required" }, { status: 400 });
    }

    const formData = await request.formData();
    const fields: Record<string, any> = {};
    
    // Extract non-file fields
    formData.forEach((value, key) => {
      if (!(value instanceof File)) fields[key] = value;
    });

    const parsed = productSchema.safeParse(fields);
    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const data = parsed.data;

    // --- Image Handling Logic ---
    // 1. Get existing images from DB to decide what to keep/delete
    const currentProduct = await prisma.product.findUnique({
      where: { id },
      include: { images: true }
    });

    if (!currentProduct) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    // 2. Upload NEW images to Cloudinary
    const newImageFiles = formData.getAll("extraImages").filter((f) => f instanceof File && f.size > 0) as File[];
    const mainImageFile = formData.get("mainImage") as File;
    
    const newUploadedUrls: string[] = [];

    // Upload Main if present
    if (mainImageFile && mainImageFile.size > 0) {
      const url = await uploadToCloudinary(mainImageFile, "products") as string;
      newUploadedUrls.push(url);
    }

    // Upload Extras
    for (const file of newImageFiles) {
      const url = await uploadToCloudinary(file, "products") as string;
      newUploadedUrls.push(url);
    }

    // 3. Database Update
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        brand: data.brand,
        price: new Prisma.Decimal(data.price),
        discountPrice: data.discountPrice ? new Prisma.Decimal(data.discountPrice) : null,
        status: data.status,
        stock: data.stock,
        sku: data.sku,
        category: data.categoryId ? { connect: { id: data.categoryId } } : undefined,
        
        // Handling Images: Simplest "Update" approach is to replace the image set
        // If new images were uploaded, we append them or replace them based on your UI logic.
        // For now, let's APPEND new ones to the existing set:
        images: newUploadedUrls.length > 0 ? {
          create: newUploadedUrls.map((url, index) => ({
            url,
            order: currentProduct.images.length + index,
            alt: data.title
          }))
        } : undefined
      },
      include: { images: true }
    });

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (err) {
    console.error("PUT Error:", err);
    return NextResponse.json({ success: false, message: "Update failed" }, { status: 500 });
  }
}

/* ===========================
   DELETE /api/products?id=PRODUCT_ID
=========================== */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id"); // Single ID
    const idsParam = searchParams.get("ids"); // Comma-separated list for bulk

    const idsToDelete = idsParam ? idsParam.split(",") : id ? [id] : [];

    if (idsToDelete.length === 0) {
      return NextResponse.json(
        { success: false, message: "No IDs provided for deletion" }, 
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // 1. Delete Related Images for all IDs
      await tx.productImage.deleteMany({
        where: { productId: { in: idsToDelete } },
      });

      // 2. Delete Related Variants for all IDs
      await tx.variant.deleteMany({
        where: { productId: { in: idsToDelete } },
      });

      // 3. Finally, delete the Products
      await tx.product.deleteMany({
        where: { id: { in: idsToDelete } },
      });
    });

    return NextResponse.json({ 
      success: true, 
      message: `${idsToDelete.length} products deleted successfully` 
    });
  } catch (err) {
    console.error("DELETE Error:", err);
    return NextResponse.json(
      { success: false, message: "Delete failed" },
      { status: 500 }
    );
  }
}