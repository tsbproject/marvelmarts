// app/api/products/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import formidable, { File } from "formidable";
import path from "path";
import fs from "fs/promises";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Disable Next.js body parsing for formidable
export const config = {
  api: { bodyParser: false },
};

/* ===========================
   Zod schemas and types
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

interface ParsedForm {
  fields: ProductFormFields;
  files: {
    mainImage?: File | File[];
    extraImages?: File | File[];
  };
}

type FormFieldsRaw = Record<string, string | string[]>;
type FilesRaw = Record<string, File | File[]>;

/* ===========================
   Utilities
=========================== */

async function ensureUploadsDir(dir: string) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

function normalizeFields(fields: FormFieldsRaw): Record<string, string> {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [
      key,
      Array.isArray(value) ? (value[0] ?? "") : (value ?? ""),
    ])
  );
}

function toImageUrlsFromFiles(files: ParsedForm["files"]): string[] {
  const urls: string[] = [];

  const pushFile = (f: File) => {
    // Optional MIME check
    if (f.mimetype && !f.mimetype.startsWith("image/")) return;
    urls.push(`/uploads/${path.basename(f.filepath)}`);
  };

  const main = files.mainImage;
  if (main) {
    if (Array.isArray(main)) {
      main.forEach(pushFile);
    } else {
      pushFile(main);
    }
  }

  const extras = files.extraImages;
  if (extras) {
    if (Array.isArray(extras)) {
      extras.forEach(pushFile);
    } else {
      pushFile(extras);
    }
  }

  return urls;
}

/* ===========================
   Formidable parser
=========================== */

async function parseForm(req: Request): Promise<ParsedForm> {
  const uploadDir = path.join(process.cwd(), "public/uploads");
  await ensureUploadsDir(uploadDir);

  const form = formidable({
    multiples: true,
    uploadDir,
    keepExtensions: true,
  });

  return new Promise<ParsedForm>((resolve, reject) => {
    form.parse(req as unknown as NodeJS.ReadableStream, (err, fields, files) => {
      if (err) return reject(err);

      const normalized = normalizeFields(fields as FormFieldsRaw);
      const parsed = productSchema.safeParse(normalized);
      if (!parsed.success) return reject(parsed.error);

      resolve({
        fields: parsed.data,
        files: files as FilesRaw as ParsedForm["files"],
      });
    });
  });
}

/* ===========================
   POST /api/products
=========================== */

export async function POST(request: Request) {
  try {
    const { fields, files } = await parseForm(request);

    const slug = fields.title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");

    const imageUrls = toImageUrlsFromFiles(files);

    const product = await prisma.product.create({
      data: {
        ...fields,
        slug,
        images: imageUrls.length ? { create: imageUrls.map((url) => ({ url })) } : undefined,
      },
      include: { images: true, category: true },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        product,
        imageUrls,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/products error:", err);

    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: err.flatten().fieldErrors, product: null },
        { status: 400 }
      );
    }

    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { success: false, message, product: null },
      { status: 500 }
    );
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

    // Ensure numeric fields are plain numbers (in case of Decimal types)
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
