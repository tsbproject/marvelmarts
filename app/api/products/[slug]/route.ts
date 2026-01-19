// // app/api/products/[slug]/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import prisma from "@/app/lib/prisma";
// import { productSchema } from "@/app/lib/validations/product";

// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

// /* ===========================
//    GET /api/products/[slug]
// =========================== */
// export async function GET(
//   request: NextRequest,
//   { params }: { params: Promise<{ slug: string }> }
// ) {
//   try {
//     const { slug } = await params;

//     const product = await prisma.product.findUnique({
//       where: { slug },
//       include: {
//         images: true,
//         category: true,
//         variants: true,
//         reviews: true,
//       },
//     });

//     if (!product) {
//       return NextResponse.json({ message: "Product not found" }, { status: 404 });
//     }

//     const safeProduct = {
//       ...product,
//       price: product.price ? Number(product.price) : 0,
//       discountPrice: product.discountPrice
//         ? Number(product.discountPrice)
//         : null,
//       variants: product.variants.map((v) => ({
//         ...v,
//         price: v.price ? Number(v.price) : 0,
//       })),
//     };

//     return NextResponse.json(safeProduct);
//   } catch (err) {
//     const message = err instanceof Error ? err.message : "Unknown error";
//     console.error("GET /api/products/[slug] error:", err);
//     return NextResponse.json({ message }, { status: 500 });
//   }
// }

// /* ===========================
//    PUT /api/products/[slug]
// =========================== */
// export async function PUT(
//   request: NextRequest,
//   { params }: { params: Promise<{ slug: string }> }
// ) {
//   try {
//     const { slug } = await params;
//     const body = await request.json();
//     const parsed = productSchema.parse(body);

//     const product = await prisma.product.update({
//       where: { slug },
//       data: {
//         title: parsed.title,
//         description: parsed.description,
//         brand: parsed.brand,
//         price: parsed.price,
//         discountPrice: parsed.discountPrice,
//         categoryId: parsed.categoryId,
//         status: parsed.status,
//         isFeatured: parsed.isFeatured,
//         isPublished: parsed.isPublished,
//         metaTitle: parsed.metaTitle,
//         metaDescription: parsed.metaDescription,
//       },
//       include: { images: true, category: true, variants: true },
//     });

//     const safeProduct = {
//       ...product,
//       price: product.price ? Number(product.price) : 0,
//       discountPrice: product.discountPrice
//         ? Number(product.discountPrice)
//         : null,
//       variants: product.variants.map((v) => ({
//         ...v,
//         price: v.price ? Number(v.price) : 0,
//       })),
//     };

//     return NextResponse.json(safeProduct);
//   } catch (err: any) {
//     if (err?.errors) {
//       return NextResponse.json({ errors: err.errors }, { status: 400 });
//     }
//     const message = err instanceof Error ? err.message : "Unknown error";
//     console.error("PUT /api/products/[slug] error:", err);
//     return NextResponse.json({ message }, { status: 500 });
//   }
// }

// /* ===========================
//    DELETE /api/products/[slug]
// =========================== */
// export async function DELETE(
//   request: NextRequest,
//   { params }: { params: Promise<{ slug: string }> }
// ) {
//   try {
//     const { slug } = await params;

//     await prisma.product.delete({
//       where: { slug },
//     });

//     return NextResponse.json({
//       message: "Product deleted successfully",
//     });
//   } catch (err) {
//     const message = err instanceof Error ? err.message : "Unknown error";
//     console.error("DELETE /api/products/[slug] error:", err);
//     return NextResponse.json({ message }, { status: 500 });
//   }
// }





import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { productSchema } from "@/app/lib/validations/product";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ===========================
   Helper: Format Decimal to Number
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
        images: true,
        category: true,
        variants: true,
        reviews: true,
        vendor: { // 🔹 Include vendor info for the marketplace
          select: {
            name: true,
            vendorProfile: true,
          }
        }
      },
    });

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(formatSafeProduct(product));
  } catch (err) {
    console.error("GET error:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

/* ===========================
   PUT /api/products/[slug]
=========================== */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { slug } = await params;
    
    // 1. Find the product first to check ownership
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
      select: { vendorId: true }
    });

    if (!existingProduct) return NextResponse.json({ message: "Not found" }, { status: 404 });

    // 2. 🔐 SECURITY CHECK: Only Admin or the Owner can update
    const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";
    const isOwner = existingProduct.vendorId === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ message: "Forbidden: You do not own this product" }, { status: 403 });
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
        isPublished: parsed.isPublished,
        metaTitle: parsed.metaTitle,
        metaDescription: parsed.metaDescription,
        // vendorId stays the same to prevent hijacking
      },
      include: { images: true, category: true, variants: true },
    });

    return NextResponse.json(formatSafeProduct(updatedProduct));
  } catch (err: any) {
    if (err?.errors) return NextResponse.json({ errors: err.errors }, { status: 400 });
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
    const { slug } = await params;

    const existingProduct = await prisma.product.findUnique({
      where: { slug },
      select: { vendorId: true }
    });

    if (!existingProduct) return NextResponse.json({ message: "Not found" }, { status: 404 });

    // 🔐 SECURITY CHECK
    const isAdmin = session?.user.role === "ADMIN" || session?.user.role === "SUPER_ADMIN";
    const isOwner = existingProduct.vendorId === session?.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await prisma.product.delete({ where: { slug } });

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (err) {
    return NextResponse.json({ message: "Delete failed" }, { status: 500 });
  }
}