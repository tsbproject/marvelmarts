


export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import ProductDetails from "./ProductDetails";
import type { Product, Category, ProductImage } from "@prisma/client";

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
  reviews: {
    id: string;
    rating: number;
    body: string | null; // SCHEMA FIX: comment -> body
    createdAt: string;
    isVerified: boolean; // TACTICAL UPGRADE
    user: { name: string | null };
  }[];
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
    reviews: {
      where: { approved: true },
      include: {
        user: {
          select: {
            name: true,
            orders: {
              where: {
                items: {
                  some: {
                  
                    productId: { not: undefined } 
                  }
                },
                status: "DELIVERED"
              },
             
              select: {
                items: {
                  select: { productId: true }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" },
    },
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

  const formattedProduct: ProductWithRelations = {
    ...product,
    price: Number(product.price),
    discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    category: product.category,
    images: product.images.length > 0 ? product.images : [],
    imageUrl: product.images.length > 0 ? product.images[0].url : "/logo.png",

    variants: product.variants.map((v) => ({
      ...v,
      price: Number(v.price),
    })),

    // Mapping reviews with correct Schema field 'body' and Verified logic
    reviews: product.reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      body: r.body, // Fixed field name
      createdAt: r.createdAt.toISOString(),
      // Logic: If user has at least 1 delivered order containing this product
      isVerified: r.user.orders.some(order => 
        order.items.some((item: any) => item.productId === product.id)
      ),
      user: { name: r.user.name },
    })),
  };

  const formattedSimilar = similarProducts.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    price: Number(p.price),
    discountPrice: p.discountPrice ? Number(p.discountPrice) : null,
    imageUrl: p.images[0]?.url || "/logo.png",
  }));

  return <ProductDetails product={formattedProduct} similarItems={formattedSimilar} />;
}