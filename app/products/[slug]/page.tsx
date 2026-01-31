// // app/products/[slug]/page.tsx
// export const dynamic = "force-dynamic"

// import { notFound } from "next/navigation";
// import prisma from "@/app/lib/prisma";
// import ProductDetails from "./ProductDetails";
// import type { Product, Category, ProductImage } from "@prisma/client";



// interface Props {
//   params: { slug: string };
// }

// export type ProductWithRelations = Omit<
//   Product,
//   "price" | "discountPrice" | "createdAt" | "updatedAt"
// > & {
//   price: number;
//   discountPrice: number | null;
//   createdAt: string;
//   updatedAt: string;
//   category: Category | null;
//   images: ProductImage[];
//   variants: {
//     id: string;
//     name: string;
//     price: number;
//     sku: string | null;
//     stock: number;
//     productId: string;
//   }[];
// };

// export default async function ProductPage({ params }: Props) {
//   const { slug } = params;

//   if (!slug) return notFound();

//   const product = await prisma.product.findUnique({
//     where: { slug },
//     include: {
//       category: true,
//       images: { orderBy: { order: "asc" } },
//       variants: true,
//     },
//   });

//   if (!product) return notFound();

//   const similarProducts = await prisma.product.findMany({
//     where: {
//       categoryId: product.categoryId,
//       id: { not: product.id },
//       status: "ACTIVE",
//     },
//     take: 4,
//     select: {
//       id: true,
//       title: true,
//       slug: true,
//       price: true,
//       discountPrice: true,
//       images: { take: 1, select: { url: true } },
//     },
//   });

//   const formattedProduct: ProductWithRelations = {
//     ...product,
//     price: Number(product.price),
//     discountPrice: product.discountPrice
//       ? Number(product.discountPrice)
//       : null,
//     createdAt: product.createdAt.toISOString(),
//     updatedAt: product.updatedAt.toISOString(),
//     category: product.category,
//     images: product.images,
//     variants: product.variants.map(v => ({
//       id: v.id,
//       name: v.name,
//       price: Number(v.price),
//       sku: v.sku,
//       stock: v.stock,
//       productId: v.productId,
//     })),
//   };

//   const formattedSimilar = similarProducts.map(p => ({
//     id: p.id,
//     title: p.title,
//     slug: p.slug,
//     price: Number(p.price),
//     discountPrice: p.discountPrice
//       ? Number(p.discountPrice)
//       : null,
//     imageUrl: p.images[0]?.url || "/placeholder.png",
//   }));

//   return (
//     <ProductDetails
//       product={formattedProduct}
//       similarItems={formattedSimilar}
//     />
//   );
// }




// app/products/[slug]/page.tsx
export const dynamic = "force-dynamic"

import { notFound } from "next/navigation";
import prisma from "@/app/lib/prisma";
import ProductDetails from "./ProductDetails";
import type { Product, Category, ProductImage } from "@prisma/client";

// NEXT.JS 15 FIX: params must be a Promise
interface Props {
  params: Promise<{ slug: string }>;
}

export type ProductWithRelations = Omit<
  Product,
  "price" | "discountPrice" | "createdAt" | "updatedAt"
> & {
  price: number;
  discountPrice: number | null;
  createdAt: string;
  updatedAt: string;
  category: Category | null;
  images: ProductImage[];
  imageUrl: string;
  variants: {
    id: string;
    name: string;
    price: number;
    sku: string | null;
    stock: number;
    productId: string;
  }[];
};

export default async function ProductPage({ params }: Props) {
  // NEXT.JS 15 FIX: Unwrapping the params promise
  const { slug } = await params;

  if (!slug) return notFound();

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: { orderBy: { order: "asc" } },
      variants: true,
    },
  });

  if (!product) return notFound();

  const similarProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      status: "ACTIVE",
    },
    take: 4,
    select: {
      id: true,
      title: true,
      slug: true,
      price: true,
      discountPrice: true,
      images: { take: 1, select: { url: true } },
    },
  });

  // 1. Sanitize Main Product Images
  // This removes the broken placeholder from the gallery before it hits ProductDetails
  const sanitizedImages = product.images.filter(
    (img) => img.url && img.url !== "/images/placeholder.png"
  );



  const formattedProduct: ProductWithRelations = {
    ...product,
    price: Number(product.price),
    discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    category: product.category,
    // If the gallery is empty, use the logo.
    images: product.images.length > 0 ? product.images : [],
    
    // We override the top-level imageUrl with the first real gallery image
    imageUrl: product.images.length > 0 ? product.images[0].url : "/logo.png",

    variants: product.variants.map(v => ({
      id: v.id,
      name: v.name,
      price: Number(v.price),
      sku: v.sku,
      stock: v.stock,
      productId: v.productId,
    })),
  };

  // 2. Sanitize Similar Products
  const formattedSimilar = similarProducts.map(p => {
    const firstImg = p.images[0]?.url;
    // Strictly check against the broken path
    const safeUrl = (firstImg && firstImg !== "/images/placeholder.png") 
      ? firstImg 
      : "/logo.png";

    return {
      id: p.id,
      title: p.title,
      slug: p.slug,
      price: Number(p.price),
      discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
      imageUrl: safeUrl,
    };
  });

  return (
    <ProductDetails
      product={formattedProduct}
      similarItems={formattedSimilar}
    />
  );
}