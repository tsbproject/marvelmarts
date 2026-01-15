// app/products/[slug]/page.tsx

import { notFound } from "next/navigation";
import prisma from "@/app/lib/prisma";
import ProductDetails from "./ProductDetails"; 
import type { Product, Category, ProductImage, Variant } from "@prisma/client";

interface Props {
  params: Promise<{ slug: string }>;
}


export type ProductWithRelations = Product & {
  category: Category | null;
  images: ProductImage[];
  variants: Variant[];
};




export default async function ProductPage({ params }: Props) {
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

  // 1. Fetch Similar Items
  const similarProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      status: "ACTIVE",
    },
    take: 5,
    include: { images: { take: 1 } },
  });

  // 2. CRITICAL: Normalize the main product
  const formattedProduct = {
    ...product,
    price: Number(product.price),
    discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
    //  Decimals that need converting
    variants: product.variants.map(v => ({
      ...v,
      price: Number(v.price)
    })),
    createdAt: product.createdAt.toISOString(), // Dates also sometimes cause issues
    updatedAt: product.updatedAt.toISOString(),
  };

  // 3. Normalize similar items
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
      product={formattedProduct as any} 
      similarItems={formattedSimilar} 
    />
  );
}