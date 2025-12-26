// import { NextRequest, NextResponse } from "next/server";
// import prisma from "@/app/lib/prisma";

// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";


// export async function GET(
//   request: NextRequest,
//   { params }: { params: Promise<{ slug: string }> } // ✅ Promise type
// ) {
//   const { slug } = await params; // ✅ await the promise

//   try {
//     const product = await prisma.product.findUnique({
//       where: { slug },
//       include: {
//         category: true,
//         images: true,
//         variants: true,
//       },
//     });

//     if (!product) {
//       return NextResponse.json({ message: "Product not found" }, { status: 404 });
//     }

//     const safeProduct = {
//       ...product,
//       price: Number(product.price),
//       discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
//       variants: product.variants.map((v) => ({
//         ...v,
//         price: Number(v.price),
//       })),
//     };

//     return NextResponse.json(safeProduct);
//   } catch (err: unknown) {
//     let message = "Unknown error";
//     if (err instanceof Error) message = err.message;
//     console.error("GET /api/products/[slug] error:", err);
//     return NextResponse.json({ message }, { status: 500 });
//   }
// }



import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { productSchema } from "@/app/lib/validations/product"; // Zod schema

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/products/[slug]
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
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
      price: Number(product.price),
      discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
      variants: product.variants.map(v => ({ ...v, price: Number(v.price) })),
    };

    return NextResponse.json(safeProduct);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("GET /api/products/[slug] error:", err);
    return NextResponse.json({ message }, { status: 500 });
  }
}

// PUT /api/products/[slug]
export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json();
    const parsed = productSchema.parse(body); // validate with Zod

    const product = await prisma.product.update({
      where: { slug: params.slug },
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
      price: Number(product.price),
      discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
      variants: product.variants.map(v => ({ ...v, price: Number(v.price) })),
    };

    return NextResponse.json(safeProduct);
  } catch (err: unknown) {
    if (err instanceof Error && "errors" in err) {
      return NextResponse.json({ errors: (err as any).errors }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("PUT /api/products/[slug] error:", err);
    return NextResponse.json({ message }, { status: 500 });
  }
}

// DELETE /api/products/[slug]
export async function DELETE(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    await prisma.product.delete({
      where: { slug: params.slug },
    });

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("DELETE /api/products/[slug] error:", err);
    return NextResponse.json({ message }, { status: 500 });
  }
}
