import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma"; // Ensure correct path
import { productSchema } from "@/app/lib/validations/product";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ===========================
    Helper: Format Decimal to Number
    Ensures frontend doesn't crash on Prisma Decimal types
=========================== */
const formatSafeProduct = (product: any) => ({
  ...product,
  price: product.price ? Number(product.price) : 0,
  discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
  variants: product.variants?.map((v: any) => ({
    ...v,
    price: v.price ? Number(v.price) : 0,
  })) || [],
});

/* ===========================
    GET /api/products/[slug]
    Used for the Public Product Details Page
=========================== */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { order: "asc" } },
        category: { select: { id: true, name: true } },
        variants: true,
        reviews: { include: { user: { select: { name: true, image: true } } } },
        vendor: {
          select: {
            name: true,
            vendorProfile: true,
          }
        }
      },
    });

    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      product: formatSafeProduct(product) 
    });
  } catch (err) {
    console.error("GET error:", err);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}

/* ===========================
    PUT /api/products/[slug]
    Used for updating via Slug (Admin/Vendor)
=========================== */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { slug } = await params;
    
    // 1. Ownership & Security Check
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
      select: { id: true, vendorId: true }
    });

    if (!existingProduct) return NextResponse.json({ message: "Not found" }, { status: 404 });

    const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(session.user.role);
    const isOwner = existingProduct.vendorId === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = productSchema.parse(body);

    const updatedProduct = await prisma.product.update({
      where: { slug },
      data: {
        title: parsed.title,
        description: parsed.description,
        brand: parsed.brand,
        price: parsed.price,
        discountPrice: parsed.discountPrice,
        categoryId: parsed.categoryId,
        status: parsed.status,
        isFeatured: parsed.isFeatured,
        // Aligns with Phase 2: SEO and Metadata
        metaTitle: parsed.metaTitle || parsed.title,
        metaDescription: parsed.metaDescription || parsed.description?.substring(0, 160),
      },
      include: { images: true, category: true, variants: true },
    });

    return NextResponse.json({ 
      success: true, 
      product: formatSafeProduct(updatedProduct) 
    });
  } catch (err: any) {
    if (err?.name === "ZodError") return NextResponse.json({ errors: err.errors }, { status: 400 });
    console.error("Update error:", err);
    return NextResponse.json({ message: "Update failed" }, { status: 500 });
  }
}

/* ===========================
    DELETE /api/products/[slug]
=========================== */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { slug } = await params;

    const existingProduct = await prisma.product.findUnique({
      where: { slug },
      select: { vendorId: true }
    });

    if (!existingProduct) return NextResponse.json({ message: "Not found" }, { status: 404 });

    const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(session.user.role);
    const isOwner = existingProduct.vendorId === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await prisma.product.delete({ where: { slug } });

    return NextResponse.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    return NextResponse.json({ success: false, message: "Delete failed" }, { status: 500 });
  }
}