// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/app/lib/prisma";
// import { Prisma, ProductStatus } from "@prisma/client";
// import { z } from "zod";
// import { uploadToCloudinary, deleteFromCloudinary } from "@/app/lib/cloudinary";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/lib/auth";

// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

// /* ===========================
//    Zod Schema
// =========================== */
// const productSchema = z.object({
//   title: z.string().min(1, "Title is required"),
//   description: z.string().min(1, "Description is required"),
//   brand: z.string().optional().nullable(),
//   price: z.coerce.number().positive(),
//   discountPrice: z.coerce.number().nullable().optional(),
//   categoryId: z.string().nullable().optional(),
//   status: z.nativeEnum(ProductStatus).default(ProductStatus.ACTIVE),
//   stock: z.coerce.number().int().default(0),
//   sku: z.string().trim().optional().nullable(),
//   metaTitle: z.string().optional().nullable(),
//   metaDescription: z.string().optional().nullable(),
//   isFeatured: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional(),
//   isFlashSale: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional(),
//   isNewArrival: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional(),
//   shippingMethod: z.string().optional().nullable(),
//   weight: z.coerce.number().optional().nullable(),
// });

// /* ===========================
//    POST: Create Product
// =========================== */

// export async function POST(request: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

//     // 1. FIND THE VENDOR PROFILE FIRST
//     const vendor = await prisma.vendorProfile.findUnique({
//       where: { userId: session.user.id },
//       select: { id: true }
//     });

//     if (!vendor) {
//       return NextResponse.json({ 
//         success: false, 
//         message: "Vendor profile not found. Please log out and back in." 
//       }, { status: 404 });
//     }

//     const formData = await request.formData();
//     const fields: Record<string, any> = {};
//     formData.forEach((val, key) => { if (!(val instanceof File)) fields[key] = val; });

//     const parsed = productSchema.safeParse(fields);
//     if (!parsed.success) return NextResponse.json({ success: false, errors: parsed.error.flatten().fieldErrors }, { status: 400 });

//     const data = parsed.data;
//     const variants = JSON.parse((formData.get("variants") as string) || "[]");
//     const slug = `${data.title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "")}-${Date.now()}`;

//     const imageUrls: string[] = [];
//     for (const [key, value] of formData.entries()) {
//       if (value instanceof File && (key === "mainImage" || key === "extraImages") && value.size > 0) {
//         const url = await uploadToCloudinary(value, "products") as string;
//         imageUrls.push(url);
//       }
//     }

//     const product = await prisma.$transaction(async (tx) => {
//       // 2. Create the Product using vendor.id (NOT session.user.id)
//       const newProduct = await tx.product.create({
//         data: {
//           title: data.title,
//           slug,
//           sku: data.sku,
//           description: data.description,
//           brand: data.brand,
//           price: new Prisma.Decimal(data.price),
//           discountPrice: data.discountPrice ? new Prisma.Decimal(data.discountPrice) : null,
//           stock: data.stock,
//           status: data.status,
//           metaTitle: data.metaTitle,
//           metaDescription: data.metaDescription,
//           isFeatured: data.isFeatured ?? false,
//           isFlashSale: data.isFlashSale ?? false,
//           isNewArrival: data.isNewArrival ?? false,
//           shippingMethod: data.shippingMethod,
//           weight: data.weight,
//           // FIX HERE: Using the correct vendor ID
//           vendorProfile: { connect: { id: vendor.id } },
//           category: data.categoryId ? { connect: { id: data.categoryId } } : undefined,
//           images: {
//             create: imageUrls.map((url, index) => ({ url, order: index, alt: data.title })),
//           },
//           variants: {
//             create: variants.map((v: any) => ({
//               name: v.name,
//               sku: v.sku,
//               price: v.price ? new Prisma.Decimal(v.price) : null,
//               stock: v.stock || 0,
//               attributes: { name: v.name }
//             }))
//           }
//         },
//         include: { images: true, category: true, variants: true },
//       });

//       // 3. Update Onboarding using vendor.id
//       await tx.vendorOnboarding.update({
//         where: { vendorProfileId: vendor.id },
//         data: { productDone: true }
//       });

//       return newProduct;
//     });

//     return NextResponse.json({ success: true, product }, { status: 201 });
//   } catch (err: any) {
//     console.error("POST Error:", err);
//     return NextResponse.json({ success: false, message: err.message || "Internal Server Error" }, { status: 500 });
//   }
// }

// /* ===========================
//    PATCH: Bulk Update Logic
// =========================== */
// export async function PATCH(request: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

//     const body = await request.json();
//     const { ids, updateType, applyToAll, filters } = body;

//     const fieldMapping: Record<string, string> = {
//       isFeatured: "isFeatured",
//       isFlashSale: "isFlashSale",
//       isNew: "isNewArrival",
//       isNewArrival: "isNewArrival",
//       status: "status"
//     };

//     const dbField = fieldMapping[updateType];
//     if (!dbField) return NextResponse.json({ success: false, message: "Invalid update type" }, { status: 400 });

//     let targetIds: string[] = ids || [];
//     const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";

//     if (applyToAll && filters) {
//       const where: any = isAdmin ? {} : { vendorId: session.user.id };
//       const products = await prisma.product.findMany({ where, select: { id: true } });
//       targetIds = products.map(p => p.id);
//     }

//     const currentProducts = await prisma.product.findMany({
//       where: { id: { in: targetIds }, ...(isAdmin ? {} : { vendorId: session.user.id }) },
//       select: { id: true, [dbField]: true }
//     });

//     await prisma.$transaction(
//       currentProducts.map((p: any) => prisma.product.update({
//         where: { id: p.id },
//         data: { [dbField]: updateType === "status" ? ProductStatus.ARCHIVED : !p[dbField] }
//       }))
//     );

//     return NextResponse.json({ success: true, message: "Bulk update successful" });
//   } catch (err) {
//     return NextResponse.json({ success: false, message: "Bulk update failed" }, { status: 500 });
//   }
// }

// /* ===========================
//    PUT: Update Single Product
// =========================== */

// export async function PUT(request: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions);
//     const { searchParams } = new URL(request.url);
//     const id = searchParams.get("id");

//     if (!id || !session?.user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

//     const formData = await request.formData();
//     const fields: Record<string, any> = {};
//     formData.forEach((val, key) => { if (!(val instanceof File)) fields[key] = val; });

//     const parsed = productSchema.safeParse(fields);
//     if (!parsed.success) return NextResponse.json({ success: false, errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    
//     const data = parsed.data;
//     const variants = JSON.parse((formData.get("variants") as string) || "[]");
//     const deletedImageIds = JSON.parse((formData.get("deletedImageIds") as string) || "[]");

//     const existingProduct = await prisma.product.findUnique({ where: { id }, select: { vendorProfileId: true } });
//     if (!existingProduct) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });

//     const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";
//     if (existingProduct.vendorProfileId !== session.user.id && !isAdmin) return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });

//     // Image Uploads
//     const imageOperations: any[] = [];
//     for (const [key, value] of formData.entries()) {
//       if (value instanceof File && value.size > 0) {
//         const url = await uploadToCloudinary(value, "products");
//         imageOperations.push({ url, order: key === "mainImage" ? 0 : 1, alt: data.title });
//       }
//     }

//     const updated = await prisma.$transaction(async (tx) => {
//       if (deletedImageIds.length > 0) await tx.productImage.deleteMany({ where: { id: { in: deletedImageIds } } });
      
//       // Delete existing variants to avoid SKU conflicts or orphan records
//       await tx.variant.deleteMany({ where: { productId: id } });

//       return await tx.product.update({
//         where: { id },
//         data: {
//           title: data.title,
//           sku: data.sku || null,
//           description: data.description,
//           brand: data.brand || null,
//           price: new Prisma.Decimal(data.price),
//           discountPrice: data.discountPrice ? new Prisma.Decimal(data.discountPrice) : null,
//           stock: Number(data.stock),
//           status: data.status,
//           metaTitle: data.metaTitle || null,
//           metaDescription: data.metaDescription || null,
//           isFeatured: data.isFeatured ?? false,
//           isFlashSale: data.isFlashSale ?? false,
//           isNewArrival: data.isNewArrival ?? false,
//           // Only include these if you are 100% sure they are in your schema.prisma
//           // shippingMethod: data.shippingMethod || null,
//           // weight: data.weight ? Number(data.weight) : null,
//           category: data.categoryId ? { connect: { id: data.categoryId } } : { disconnect: true },
//           images: imageOperations.length > 0 ? { create: imageOperations } : undefined,
//           variants: {
//             create: variants.map((v: any) => ({
//               name: v.name,
//               sku: v.sku || `${data.sku || 'sku'}-${Math.random().toString(36).substring(7)}`,
//               price: v.price ? new Prisma.Decimal(v.price) : null,
//               stock: Number(v.stock) || 0,
//               attributes: v.attributes || { name: v.name }
//             }))
//           }
//         },
//         include: { images: true, variants: true }
//       });
//     });

//     return NextResponse.json({ success: true, product: updated });
//   } catch (err: any) {
//     console.error("CRITICAL PUT ERROR:", err);
//     // This logs the full error to your VS Code terminal
//     return NextResponse.json({ 
//       success: false, 
//       message: err.message || "Update failed",
//       code: err.code 
//     }, { status: 500 });
//   }
// }

// /* ===========================
//    GET & DELETE
// =========================== */
// export async function GET(request: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions);
//     const { searchParams } = new URL(request.url);
//     const id = searchParams.get("id");
//     const viewOwn = searchParams.get("own") === "true";

//     if (id) {
//       const product = await prisma.product.findUnique({
//         where: { id },
//         include: { category: { select: { id: true, name: true } }, images: { orderBy: { order: "asc" } }, variants: true },
//       });
//       if (!product) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
//       return NextResponse.json({ success: true, product: { ...product, price: Number(product.price), discountPrice: product.discountPrice ? Number(product.discountPrice) : null, variants: product.variants.map(v => ({ ...v, price: v.price ? Number(v.price) : null })) } });
//     }

//     const items = await prisma.product.findMany({
//       where: { vendorProfileId: viewOwn ? session?.user?.id : undefined, status: viewOwn ? undefined : "ACTIVE" },
//       orderBy: { createdAt: "desc" },
//       include: { category: { select: { id: true, name: true } }, images: { orderBy: { order: "asc" } } },
//     });

//     return NextResponse.json({ success: true, items: items.map(p => ({ ...p, price: Number(p.price), discountPrice: p.discountPrice ? Number(p.discountPrice) : null })) });
//   } catch (err) {
//     return NextResponse.json({ success: false, message: "Fetch failed" }, { status: 500 });
//   }
// }

// export async function DELETE(request: NextRequest) {
//   try {
//     const session = await getServerSession(authOptions);
//     const { searchParams } = new URL(request.url);
//     const id = searchParams.get("id");
//     if (!id || !session?.user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

//     const product = await prisma.product.findUnique({ where: { id }, include: { images: true } });
//     if (!product) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });

//     if (product.vendorProfileId !== session.user.id && session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
//       return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
//     }

//     if (product.images.length > 0) await Promise.all(product.images.map((img) => deleteFromCloudinary(img.url)));

//     await prisma.$transaction([
//       prisma.productImage.deleteMany({ where: { productId: id } }),
//       prisma.variant.deleteMany({ where: { productId: id } }),
//       prisma.product.delete({ where: { id } }),
//     ]);

//     return NextResponse.json({ success: true, message: "Product deleted" });
//   } catch (err) {
//     return NextResponse.json({ success: false, message: "Delete failed" }, { status: 500 });
//   }
// }




import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { Prisma, ProductStatus } from "@prisma/client";
import { z } from "zod";
import { uploadToCloudinary, deleteFromCloudinary } from "@/app/lib/cloudinary";
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
  isFlashSale: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional(),
  isNewArrival: z.preprocess((val) => val === 'true' || val === true, z.boolean()).optional(),
  shippingMethod: z.string().optional().nullable(),
  weight: z.coerce.number().optional().nullable(),
});

/* ===========================
   POST: Create Product
=========================== */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    // 1. FIND THE VENDOR PROFILE & CHECK SUSPENSION
    const vendor = await prisma.vendorProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, isSuspended: true } // Added isSuspended check
    });

    if (!vendor) {
      return NextResponse.json({ success: false, message: "Vendor profile not found." }, { status: 404 });
    }

    // BLOCK SUSPENDED VENDORS FROM CREATING PRODUCTS
    if (vendor.isSuspended) {
      return NextResponse.json({ 
        success: false, 
        message: "Your account is suspended. You cannot list new products." 
      }, { status: 403 });
    }

    const formData = await request.formData();
    const fields: Record<string, any> = {};
    formData.forEach((val, key) => { if (!(val instanceof File)) fields[key] = val; });

    const parsed = productSchema.safeParse(fields);
    if (!parsed.success) return NextResponse.json({ success: false, errors: parsed.error.flatten().fieldErrors }, { status: 400 });

    const data = parsed.data;
    const variants = JSON.parse((formData.get("variants") as string) || "[]");
    const slug = `${data.title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "")}-${Date.now()}`;

    const imageUrls: string[] = [];
    for (const [key, value] of formData.entries()) {
      if (value instanceof File && (key === "mainImage" || key === "extraImages") && value.size > 0) {
        const url = await uploadToCloudinary(value, "products") as string;
        imageUrls.push(url);
      }
    }

    const product = await prisma.$transaction(async (tx) => {
      const newProduct = await tx.product.create({
        data: {
          title: data.title,
          slug,
          sku: data.sku,
          description: data.description,
          brand: data.brand,
          price: new Prisma.Decimal(data.price),
          discountPrice: data.discountPrice ? new Prisma.Decimal(data.discountPrice) : null,
          stock: data.stock,
          status: data.status,
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          isFeatured: data.isFeatured ?? false,
          isFlashSale: data.isFlashSale ?? false,
          isNewArrival: data.isNewArrival ?? false,
          shippingMethod: data.shippingMethod,
          weight: data.weight,
          vendorProfile: { connect: { id: vendor.id } },
          category: data.categoryId ? { connect: { id: data.categoryId } } : undefined,
          images: {
            create: imageUrls.map((url, index) => ({ url, order: index, alt: data.title })),
          },
          variants: {
            create: variants.map((v: any) => ({
              name: v.name,
              sku: v.sku,
              price: v.price ? new Prisma.Decimal(v.price) : null,
              stock: v.stock || 0,
              attributes: { name: v.name }
            }))
          }
        },
        include: { images: true, category: true, variants: true },
      });

      await tx.vendorOnboarding.update({
        where: { vendorProfileId: vendor.id },
        data: { productDone: true }
      });

      return newProduct;
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || "Internal Server Error" }, { status: 500 });
  }
}

/* ===========================
   GET: Fetching (Public & Private)
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
          variants: true,
          vendorProfile: { select: { isSuspended: true, status: true } } // Check vendor status on single product
        },
      });

      if (!product) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });

      // If viewing publicly, hide if vendor is suspended
      if (!viewOwn && (product.vendorProfile.isSuspended || product.vendorProfile.status !== "APPROVED")) {
        return NextResponse.json({ success: false, message: "Product currently unavailable" }, { status: 403 });
      }

      return NextResponse.json({ success: true, product: { ...product, price: Number(product.price), discountPrice: product.discountPrice ? Number(product.discountPrice) : null, variants: product.variants.map(v => ({ ...v, price: v.price ? Number(v.price) : null })) } });
    }

    // MAIN FILTER: If it's the public grid, only show non-suspended vendors
    const items = await prisma.product.findMany({
      where: { 
        vendorProfileId: viewOwn ? session?.user?.id : undefined, 
        status: viewOwn ? undefined : "ACTIVE",
        // HIDE PRODUCTS FROM SUSPENDED VENDORS
        vendorProfile: viewOwn ? undefined : {
          isSuspended: false,
          status: "APPROVED"
        }
      },
      orderBy: { createdAt: "desc" },
      include: { category: { select: { id: true, name: true } }, images: { orderBy: { order: "asc" } } },
    });

    return NextResponse.json({ success: true, items: items.map(p => ({ ...p, price: Number(p.price), discountPrice: p.discountPrice ? Number(p.discountPrice) : null })) });
  } catch (err) {
    return NextResponse.json({ success: false, message: "Fetch failed" }, { status: 500 });
  }
}

/* ===========================
   PUT: Update Single Product
=========================== */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, message: "ID Required" }, { status: 400 });

    // Verify vendor isn't suspended before allowing edit
    const vendor = await prisma.vendorProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, isSuspended: true }
    });

    if (vendor?.isSuspended && session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Your account is suspended. Edits are disabled." }, { status: 403 });
    }

    const formData = await request.formData();
    const fields: Record<string, any> = {};
    formData.forEach((val, key) => { if (!(val instanceof File)) fields[key] = val; });

    const parsed = productSchema.safeParse(fields);
    if (!parsed.success) return NextResponse.json({ success: false, errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    
    const data = parsed.data;
    const variants = JSON.parse((formData.get("variants") as string) || "[]");
    const deletedImageIds = JSON.parse((formData.get("deletedImageIds") as string) || "[]");

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });

    const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";
    if (existingProduct.vendorProfileId !== vendor?.id && !isAdmin) return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });

    const imageOperations: any[] = [];
    for (const [key, value] of formData.entries()) {
      if (value instanceof File && value.size > 0) {
        const url = await uploadToCloudinary(value, "products");
        imageOperations.push({ url, order: key === "mainImage" ? 0 : 1, alt: data.title });
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (deletedImageIds.length > 0) await tx.productImage.deleteMany({ where: { id: { in: deletedImageIds } } });
      await tx.variant.deleteMany({ where: { productId: id } });

      return await tx.product.update({
        where: { id },
        data: {
          title: data.title,
          sku: data.sku || null,
          description: data.description,
          brand: data.brand || null,
          price: new Prisma.Decimal(data.price),
          discountPrice: data.discountPrice ? new Prisma.Decimal(data.discountPrice) : null,
          stock: Number(data.stock),
          status: data.status,
          metaTitle: data.metaTitle || null,
          metaDescription: data.metaDescription || null,
          isFeatured: data.isFeatured ?? false,
          isFlashSale: data.isFlashSale ?? false,
          isNewArrival: data.isNewArrival ?? false,
          category: data.categoryId ? { connect: { id: data.categoryId } } : { disconnect: true },
          images: imageOperations.length > 0 ? { create: imageOperations } : undefined,
          variants: {
            create: variants.map((v: any) => ({
              name: v.name,
              sku: v.sku || `${data.sku || 'sku'}-${Math.random().toString(36).substring(7)}`,
              price: v.price ? new Prisma.Decimal(v.price) : null,
              stock: Number(v.stock) || 0,
              attributes: v.attributes || { name: v.name }
            }))
          }
        },
        include: { images: true, variants: true }
      });
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || "Update failed" }, { status: 500 });
  }
}

// DELETE remains mostly same but verify via vendor.id to be safe
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id || !session?.user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const vendor = await prisma.vendorProfile.findUnique({ where: { userId: session.user.id } });
    const product = await prisma.product.findUnique({ where: { id }, include: { images: true } });
    
    if (!product) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });

    const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";
    if (product.vendorProfileId !== vendor?.id && !isAdmin) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    if (product.images.length > 0) await Promise.all(product.images.map((img) => deleteFromCloudinary(img.url)));

    await prisma.$transaction([
      prisma.productImage.deleteMany({ where: { productId: id } }),
      prisma.variant.deleteMany({ where: { productId: id } }),
      prisma.product.delete({ where: { id } }),
    ]);

    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (err) {
    return NextResponse.json({ success: false, message: "Delete failed" }, { status: 500 });
  }
}
