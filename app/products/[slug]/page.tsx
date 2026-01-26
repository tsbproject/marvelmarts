


// import { notFound } from "next/navigation";
// import prisma from "@/app/lib/prisma";
// import ProductDetails from "./ProductDetails"; 
// import type { Product, Category, ProductImage } from "@prisma/client";

// interface Props {
//   params: Promise<{ slug: string }>;
// }

// export type ProductWithRelations = Omit<Product, 'price' | 'discountPrice' | 'createdAt' | 'updatedAt' | 'variants'> & {
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

// export async function generateStaticParams() {
//   const products = await prisma.product.findMany({
//     where: { status: "ACTIVE" },
//     select: { slug: true },
//   });
//   return products.map((product) => ({ slug: product.slug }));
// }

// export default async function ProductPage({ params }: Props) {
//   const { slug } = await params;
//   if (!slug) return notFound();

//   const product = await prisma.product.findUnique({
//     where: { slug },
//     include: {
//       category: true,
//       images: { 
//         orderBy: { order: "asc" },
//         select: { id: true, url: true, alt: true, order: true, productId: true }
//       },
//       variants: {
//         select: { id: true, name: true, price: true, sku: true, stock: true, productId: true }
//       },
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
//     }
//   });

//   // Destructure to REMOVE the Prisma types that conflict with your interface
//   const { 
//     price, 
//     discountPrice, 
//     createdAt, 
//     updatedAt, 
//     variants, 
//     ...restOfProduct 
//   } = product;

//   const formattedProduct: ProductWithRelations = {
//     ...restOfProduct, // Now 'restOfProduct' does not contain the conflicting keys
//     price: Number(price),
//     discountPrice: discountPrice ? Number(discountPrice) : null,
//     createdAt: createdAt.toISOString(),
//     updatedAt: updatedAt.toISOString(),
//     variants: variants.map((v) => ({
//       id: v.id,
//       name: v.name,
//       price: Number(v.price),
//       sku: v.sku,
//       stock: v.stock,
//       productId: v.productId,
//     })),
//     images: product.images,
//     category: product.category,
//   };

//   const formattedSimilar = similarProducts.map((p) => ({
//     id: p.id,
//     title: p.title,
//     slug: p.slug,
//     price: Number(p.price),
//     discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
//     imageUrl: p.images[0]?.url || "/placeholder.png",
//   }));

//   return (
//     <ProductDetails 
//       product={formattedProduct} 
//       similarItems={formattedSimilar} 
//     />
//   );
// }


import { notFound } from "next/navigation";
import prisma from "@/app/lib/prisma";
import ProductDetails from "./ProductDetails"; 
import type { Product, Category, ProductImage } from "@prisma/client";

interface Props {
  params: Promise<{ slug: string }>;
}

export type ProductWithRelations = Omit<Product, 'price' | 'discountPrice' | 'createdAt' | 'updatedAt' | 'variants'> & {
  price: number;
  discountPrice: number | null;
  createdAt: string;
  updatedAt: string;
  category: Category | null;
  images: ProductImage[];
  variants: {
    id: string;
    name: string;
    price: number;
    sku: string | null;
    stock: number;
    productId: string;
  }[];
};

// FIX 1: Optimized Static Generation
// We use 'force-dynamic' or 'revalidate' if the DB is changing often to prevent build-time hangs
export const revalidate = 60; 

export async function generateStaticParams() {
  try {
    const products = await prisma.product.findMany({
      where: { status: "ACTIVE" },
      select: { slug: true },
      take: 100, // Limit this during build to prevent Vercel timeouts
    });
    return products.map((product) => ({ slug: product.slug }));
  } catch (error) {
    console.error("Static generation failed:", error);
    return []; // Fallback to on-demand rendering
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  if (!slug) return notFound();

  // FIX 2: Optimized Query
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: { 
        orderBy: { order: "asc" },
      },
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
    }
  });

  // FIX 3: Clean Serialization for Vercel
  // Explicitly mapping everything to satisfy the "Plain Object" requirement
  const formattedProduct: ProductWithRelations = {
    ...product,
    price: Number(product.price),
    discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    category: product.category,
    images: product.images.map(img => ({
      ...img,
      // Ensure any nested decimals in images are handled if they exist
    })),
    variants: product.variants.map((v) => ({
      id: v.id,
      name: v.name,
      price: Number(v.price),
      sku: v.sku,
      stock: v.stock,
      productId: v.productId,
    })),
  };

  const formattedSimilar = similarProducts.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    price: Number(p.price),
    discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
    imageUrl: p.images[0]?.url || "/placeholder.png",
  }));

  return (
    <ProductDetails 
      product={formattedProduct} 
      similarItems={formattedSimilar} 
    />
  );
}