// // app/api/products/[slug]/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import prisma from "@/app/lib/prisma";
// import { productSchema } from "@/app/lib/validations/product"; // Zod schema

// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

// // Reusable type for context
// type SlugContext = { params: { slug: string } };

// /* ===========================
//    GET /api/products/[slug]
//    Fetch single product by slug
// =========================== */
// export async function GET(request: NextRequest, { params }: SlugContext) {
//   try {
//     const { slug } = params;

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
//       discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
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
//    Update product by slug
// =========================== */
// export async function PUT(request: NextRequest, { params }: SlugContext) {
//   try {
//     const { slug } = params;
//     const body = await request.json();
//     const parsed = productSchema.parse(body); // validate with Zod

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
//       discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
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
//    Delete product by slug
// =========================== */
// export async function DELETE(request: NextRequest, { params }: SlugContext) {
//   try {
//     const { slug } = params;

//     await prisma.product.delete({
//       where: { slug },
//     });

//     return NextResponse.json({ message: "Product deleted successfully" });
//   } catch (err) {
//     const message = err instanceof Error ? err.message : "Unknown error";
//     console.error("DELETE /api/products/[slug] error:", err);
//     return NextResponse.json({ message }, { status: 500 });
//   }
// }




// app/api/products/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { productSchema } from "@/app/lib/validations/product";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ===========================
   GET /api/products/[slug]
=========================== */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        images: true,
        category: true,
        variants: true,
        reviews: true,
      },
    });

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    const safeProduct = {
      ...product,
      price: product.price ? Number(product.price) : 0,
      discountPrice: product.discountPrice
        ? Number(product.discountPrice)
        : null,
      variants: product.variants.map((v) => ({
        ...v,
        price: v.price ? Number(v.price) : 0,
      })),
    };

    return NextResponse.json(safeProduct);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("GET /api/products/[slug] error:", err);
    return NextResponse.json({ message }, { status: 500 });
  }
}

/* ===========================
   PUT /api/products/[slug]
=========================== */
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const body = await request.json();
    const parsed = productSchema.parse(body);

    const product = await prisma.product.update({
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
      },
      include: { images: true, category: true, variants: true },
    });

    const safeProduct = {
      ...product,
      price: product.price ? Number(product.price) : 0,
      discountPrice: product.discountPrice
        ? Number(product.discountPrice)
        : null,
      variants: product.variants.map((v) => ({
        ...v,
        price: v.price ? Number(v.price) : 0,
      })),
    };

    return NextResponse.json(safeProduct);
  } catch (err: any) {
    if (err?.errors) {
      return NextResponse.json({ errors: err.errors }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("PUT /api/products/[slug] error:", err);
    return NextResponse.json({ message }, { status: 500 });
  }
}

/* ===========================
   DELETE /api/products/[slug]
=========================== */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    await prisma.product.delete({
      where: { slug },
    });

    return NextResponse.json({
      message: "Product deleted successfully",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("DELETE /api/products/[slug] error:", err);
    return NextResponse.json({ message }, { status: 500 });
  }
}

