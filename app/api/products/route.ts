// import { NextResponse } from "next/server";
// import  { prisma } from "@/app/lib/prisma";
// import { Prisma } from "@prisma/client";
// import path from "path";
// import fs from "fs";
// import { z } from "zod";
// import { ProductStatus } from "@prisma/client";

// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

// /* ===========================
//    Zod schema for product creation
// =========================== */
// const productSchema = z.object({
//   title: z.string().min(1, "Title is required"),
//   description: z.string().min(1, "Description is required"),
//   brand: z.string().optional(),
//   price: z.coerce.number().positive("Price must be positive"),
//   discountPrice: z.coerce.number().nullable().optional(),
//   categoryId: z.string().nullable().optional(),
//   status: z.nativeEnum(ProductStatus).default(ProductStatus.ACTIVE),
//   stock: z.coerce.number().default(0),
//   sku: z
//     .string()
//     .trim()
//     .transform((val) => (val === "" ? undefined : val))
//     .optional(),
//   metaTitle: z.string().optional(),
//   metaDescription: z.string().optional(),
// });

// type ProductFormFields = z.infer<typeof productSchema>;

// /* ===========================
//    POST /api/products
// =========================== */
// export async function POST(request: Request) {
//   try {
//     const formData = await request.formData();

//     // Extract fields
//     const fields: Record<string, any> = {};
//     formData.forEach((value, key) => {
//       fields[key] = value;
//     });

//     // Validate with Zod
//     const parsed = productSchema.safeParse(fields);
//     if (!parsed.success) {
//       return NextResponse.json(
//         { success: false, errors: parsed.error.flatten().fieldErrors },
//         { status: 400 }
//       );
//     }

//     const data: ProductFormFields = parsed.data;

//     // Generate slug
//     const slug = data.title
//       .toLowerCase()
//       .replace(/\s+/g, "-")
//       .replace(/[^\w-]+/g, "");

//     // Handle file uploads
//     const files: string[] = [];
//     const uploadDir = path.join(process.cwd(), "public/uploads");
//     fs.mkdirSync(uploadDir, { recursive: true });

//     for (const [key, value] of formData.entries()) {
//       if (value instanceof File) {
//         const arrayBuffer = await value.arrayBuffer();
//         const buffer = Buffer.from(arrayBuffer);
//         const filename = `${Date.now()}-${value.name}`;
//         const saveTo = path.join(uploadDir, filename);
//         fs.writeFileSync(saveTo, buffer);
//         files.push(`/uploads/${filename}`);
//       }
//     }

//     // Build product data safely
//     const productData: Prisma.ProductCreateInput = {
//       title: data.title,
//       description: data.description,
//       brand: data.brand,
//       price: new Prisma.Decimal(data.price), //Decimal
//       discountPrice:
//         data.discountPrice != null ? new Prisma.Decimal(data.discountPrice) : null,
//       status: data.status,
//       stock: data.stock,
//       slug,
//       ...(data.sku ? { sku: data.sku } : {}),
//       ...(data.metaTitle ? { metaTitle: data.metaTitle } : {}),
//       ...(data.metaDescription ? { metaDescription: data.metaDescription } : {}),
//       category: data.categoryId ? { connect: { id: data.categoryId } } : undefined,
//       images: files.length ? { create: files.map((url) => ({ url })) } : undefined,
//     };

//     // Create product
//     const product = await prisma.product.create({
//       data: productData,
//       include: { images: true, category: true },
//     });

//     return NextResponse.json(
//       {
//         success: true,
//         message: "Product created successfully",
//         product,
//         slug: product.slug,
//         imageUrls: files,
//       },
//       { status: 201 }
//     );
//   } catch (err) {
//     console.error("POST /api/products error:", err);
//     const message = err instanceof Error ? err.message : "Unknown error";
//     return NextResponse.json({ success: false, message }, { status: 500 });
//   }
// }

// /* ===========================
//    GET /api/products
// =========================== */
// const listQuerySchema = z.object({
//   page: z.coerce.number().int().min(1).default(1),
//   pageSize: z.coerce.number().int().min(1).max(100).default(10),
//   search: z.string().trim().optional(),
//   category: z.string().optional(),
//   status: z
//     .string()
//     .transform((val) => val.toUpperCase())
//     .pipe(z.nativeEnum(ProductStatus))
//     .optional(),
// });

// export async function GET(request: Request) {
//   try {
//     const { searchParams } = new URL(request.url);

//     const parsed = listQuerySchema.safeParse({
//       page: searchParams.get("page") || undefined,
//       pageSize: searchParams.get("pageSize") || undefined,
//       search: searchParams.get("search") || undefined,
//       category: searchParams.get("category") || undefined,
//       status: searchParams.get("status") || undefined,
//     });

//     if (!parsed.success) {
//       return NextResponse.json(
//         { success: false, errors: parsed.error.flatten().fieldErrors },
//         { status: 400 }
//       );
//     }

//     const { page, pageSize, search, category, status } = parsed.data;

//     const where: Prisma.ProductWhereInput = {
//       status: status ?? undefined,
//       category: category ? { slug: category } : undefined,
//       OR: search
//         ? [
//             { title: { contains: search, mode: "insensitive" } },
//             { description: { contains: search, mode: "insensitive" } },
//           ]
//         : undefined,
//     };

//     const total = await prisma.product.count({ where });
//     const totalPages = Math.max(1, Math.ceil(total / pageSize));
//     const safePage = Math.min(Math.max(page, 1), totalPages);

//     const items = await prisma.product.findMany({
//       where,
//       orderBy: { createdAt: "desc" },
//       skip: (safePage - 1) * pageSize,
//       take: pageSize,
//       include: {
//         category: { select: { name: true } },
//       },
//     });

//     // Normalize Decimal fields to numbers
//     const normalizedItems = items.map((p) => ({
//       id: p.id,
//       slug: p.slug,
//       title: p.title,
//       price: Number(p.price), //convert Decimal to number
//       discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
//       status: p.status,
//       stock: p.stock,
//       category: p.category ? { name: p.category.name } : undefined,
//     }));

//     return NextResponse.json({
//       success: true,
//       items: normalizedItems,
//       total,
//       page: safePage,
//       pageSize,
//       totalPages,
//     });
//   } catch (err) {
//     console.error("GET /api/products error:", err);
//     const message = err instanceof Error ? err.message : "Unknown error";

//     return NextResponse.json(
//       {
//         success: false,
//         message,
//         items: [],
//         total: 0,
//         page: 1,
//         pageSize: 10,
//         totalPages: 1,
//       },
//       { status: 500 }
//     );
//   }
// }




import { NextResponse } from "next/server";
import  { prisma } from "@/app/lib/prisma";
import { Prisma } from "@prisma/client";
import path from "path";
import fs from "fs";
import { z } from "zod";
import { ProductStatus } from "@prisma/client";

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
    const files: string[] = [];
    const uploadDir = path.join(process.cwd(), "public/uploads");
    fs.mkdirSync(uploadDir, { recursive: true });

    for (const [, value] of formData.entries()) {
      if (value instanceof File) {
        const arrayBuffer = await value.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const filename = `${Date.now()}-${value.name}`;
        const saveTo = path.join(uploadDir, filename);
        fs.writeFileSync(saveTo, buffer);
        files.push(`/uploads/${filename}`);
      }
    }

    const productData: Prisma.ProductCreateInput = {
      title: data.title,
      description: data.description,
      brand: data.brand,
      price: new Prisma.Decimal(data.price),
      discountPrice:
        data.discountPrice != null ? new Prisma.Decimal(data.discountPrice) : null,
      status: data.status,
      stock: data.stock,
      slug,
      ...(data.sku ? { sku: data.sku } : {}),
      ...(data.metaTitle ? { metaTitle: data.metaTitle } : {}),
      ...(data.metaDescription ? { metaDescription: data.metaDescription } : {}),
      category: data.categoryId ? { connect: { id: data.categoryId } } : undefined,
      images: files.length ? { create: files.map((url) => ({ url })) } : undefined,
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
const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  category: z.string().optional(),
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
    });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { page, pageSize, search, category, status } = parsed.data;

    const where: Prisma.ProductWhereInput = {
      status: status ?? undefined,
      category: category ? { slug: category } : undefined,
      OR: search
        ? [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ]
        : undefined,
    };

    const total = await prisma.product.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(Math.max(page, 1), totalPages);

    const items = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (safePage - 1) * pageSize,
      take: pageSize,
      include: { category: { select: { name: true } } },
    });

    const normalizedItems = items.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      price: Number(p.price),
      discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
      status: p.status,
      stock: p.stock,
      category: p.category ? { name: p.category.name } : undefined,
    }));

    return NextResponse.json({
      success: true,
      items: normalizedItems,
      total,
      page: safePage,
      pageSize,
      totalPages,
    });
  } catch (err) {
    console.error("GET /api/products error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, message }, { status: 500 });
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
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

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

    const updateData: Prisma.ProductUpdateInput = {
      title: data.title,
      description: data.description,
      brand: data.brand,
      price: new Prisma.Decimal(data.price),
      discountPrice:
        data.discountPrice != null ? new Prisma.Decimal(data.discountPrice) : null,
      status: data.status,
      stock: data.stock,
      ...(data.sku ? { sku: data.sku } : {}),
      ...(data.metaTitle ? { metaTitle: data.metaTitle } : {}),
      ...(data.metaDescription ? { metaDescription: data.metaDescription } : {}),
      category: data.categoryId ? { connect: { id: data.categoryId } } : undefined,
    };

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: { images: true, category: true },
    });

    return NextResponse.json(
      { success: true, message: "Product updated successfully", product },
      { status: 200 }
    );
  } catch (err) {
    console.error("PUT /api/products error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

/* ===========================
   DELETE /api/products?id=PRODUCT_ID
=========================== */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Product ID is required" },
        { status: 400 }
      );
    }

    // Delete product and related images
    const product = await prisma.product.delete({
      where: { id },
      include: { images: true, category: true },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Product deleted successfully",
        product,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("DELETE /api/products error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
