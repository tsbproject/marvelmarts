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

    const busboy = Busboy({ headers: Object.fromEntries(req.headers) });
    const nodeStream = Readable.fromWeb(req.body as any);

    const uploadDir = path.join(process.cwd(), "public/uploads");
    fs.mkdirSync(uploadDir, { recursive: true });

    busboy.on("file", (fieldname, file, filename) => {
      const saveTo = path.join(uploadDir, `${Date.now()}-${filename}`);
      const writeStream = fs.createWriteStream(saveTo);
      file.pipe(writeStream);

      writeStream.on("close", () => {
        files.push(`/uploads/${path.basename(saveTo)}`);
      });
    });

    busboy.on("field", (fieldname, val) => {
      fields[fieldname] = val;
    });

    busboy.on("finish", () => {
      resolve({ fields, files });
    });

    busboy.on("error", reject);

    nodeStream.pipe(busboy);
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

    // Save product in DB
    const product = await prisma.product.create({
      data: {
        ...data,
        slug,
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
