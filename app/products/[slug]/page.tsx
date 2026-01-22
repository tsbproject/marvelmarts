

// import { notFound } from "next/navigation";
// import prisma from "@/app/lib/prisma";
// import ProductDetails from "./ProductDetails"; 
// import type { Product, Category, ProductImage, Variant } from "@prisma/client";

// interface Props {
//   params: Promise<{ slug: string }>;
// }

// /** * We define the interface to expect strings for Dates 
//  * because that's what's passed from Server to Client 
//  */
// export type ProductWithRelations = Omit<Product, 'price' | 'discountPrice' | 'createdAt' | 'updatedAt'> & {
//   price: number;
//   discountPrice: number | null;
//   createdAt: string;
//   updatedAt: string;
//   category: Category | null;
//   images: ProductImage[];
//   variants: (Omit<Variant, 'price'> & { price: number })[];
// };

// export default async function ProductPage({ params }: Props) {
//   const { slug } = await params;
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

//   // 1. Fetch Similar Items from the same category
//   const similarProducts = await prisma.product.findMany({
//     where: {
//       categoryId: product.categoryId,
//       id: { not: product.id },
//       status: "ACTIVE",
//     },
//     take: 4,
//     include: { images: { take: 1 } },
//   });

//   // 2. Normalize main product (Explicitly cast to our custom type)
//   const formattedProduct: ProductWithRelations = {
//     ...product,
//     price: Number(product.price),
//     discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
//     variants: product.variants.map(v => ({
//       ...v,
//       price: Number(v.price)
//     })),
//     createdAt: product.createdAt.toISOString(),
//     updatedAt: product.updatedAt.toISOString(),
//   };

//   // 3. Normalize similar items for the grid
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


export const dynamic = "force-dynamic";


import { notFound } from "next/navigation";
import prisma from "@/app/lib/prisma";
import ProductDetails from "./ProductDetails"; 
import type { Product, Category, ProductImage, Variant } from "@prisma/client";

interface Props {
  params: Promise<{ slug: string }>; //Next.js 16 requires Promise
}

export type ProductWithRelations = Omit<Product, 'price' | 'discountPrice' | 'createdAt' | 'updatedAt'> & {
  price: number;
  discountPrice: number | null;
  createdAt: string;
  updatedAt: string;
  category: Category | null;
  images: ProductImage[];
  variants: (Omit<Variant, 'price'> & { price: number })[];
};

export default async function ProductPage({ params }: Props) {
  const { slug } = await params; //must await
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
    include: { images: { take: 1 } },
  });

  const formattedProduct: ProductWithRelations = {
    ...product,
    price: Number(product.price),
    discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
    variants: product.variants.map(v => ({
      ...v,
      price: Number(v.price)
    })),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
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

