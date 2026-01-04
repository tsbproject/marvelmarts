// app/api/products/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import Busboy from "busboy";
import { Readable } from "stream";
import path from "path";
import fs from "fs";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ===========================
   Zod schema
=========================== */
const productSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  brand: z.string().optional(),
  price: z.coerce.number().positive("Price must be positive"),
  discountPrice: z.coerce.number().nullable().optional(),
  categoryId: z.string().min(1, "Category is required"),
  status: z.string().default("ACTIVE"),
  stock: z.coerce.number().default(0),
  sku: z.string().optional(),
});

type ProductFormFields = z.infer<typeof productSchema>;

/* ===========================
   Helper: parse multipart with Busboy
=========================== */
async function parseMultipart(req: Request): Promise<{ fields: Record<string, string>; files: string[] }> {
  return new Promise((resolve, reject) => {
    const fields: Record<string, string> = {};
    const files: string[] = [];

    const bb = new Busboy({ headers: Object.fromEntries(req.headers) });
    const nodeStream = Readable.fromWeb(req.body as any);

    const uploadDir = path.join(process.cwd(), "public/uploads");
    fs.mkdirSync(uploadDir, { recursive: true });

    bb.on("file", (fieldname, file, info) => {
      const saveTo = path.join(uploadDir, `${Date.now()}-${info.filename}`);
      const writeStream = fs.createWriteStream(saveTo);
      file.pipe(writeStream);
      writeStream.on("close", () => {
        files.push(`/uploads/${path.basename(saveTo)}`);
      });
    });

    bb.on("field", (fieldname, val) => {
      fields[fieldname] = val;
    });

    bb.on("finish", () => resolve({ fields, files }));
    bb.on("error", reject);

    // ✅ feed chunks manually into Busboy
    nodeStream.on("data", (chunk) => bb.write(chunk));
    nodeStream.on("end", () => bb.end());
  });
}

/* ===========================
   POST /api/products
=========================== */
export async function POST(request: Request) {
  try {
    const { fields, files } = await parseMultipart(request);

    // Validate fields with Zod
    const parsed = productSchema.safeParse(fields);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data: ProductFormFields = parsed.data;

    // Generate slug
    const slug = data.title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");

    // ✅ Normalize undefined → null for optional fields
    const product = await prisma.product.create({
      data: {
        ...data,
        slug,
        description: data.description ?? null,
        brand: data.brand ?? null,
        sku: data.sku ?? null,
        discountPrice: data.discountPrice ?? null,
        images: files.length ? { create: files.map((url) => ({ url })) } : undefined,
      },
      include: { images: true, category: true },
    });

    return NextResponse.json(
      { success: true, message: "Product created successfully", product, imageUrls: files },
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
=========================== */
const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  category: z.string().optional(),
  status: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = listQuerySchema.safeParse({
      page: searchParams.get("page"),
      pageSize: searchParams.get("pageSize"),
      search: searchParams.get("search") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      status: searchParams.get("status") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { page, pageSize, search, category, status } = parsed.data;

    const where: Parameters<typeof prisma.product.findMany>[0]["where"] = {
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
      include: {
        category: { select: { name: true } },
      },
    });

    const normalizedItems = items.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      price: Number(p.price),
      status: p.status,
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

    return NextResponse.json(
      {
        success: false,
        message,
        items: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      },
      { status: 500 }
    );
  }
}
