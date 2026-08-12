export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import ProductDetails from "./ProductDetails";
import type { Product, Category, ProductImage } from "@prisma/client";
import { ProductService } from "@/app/lib/services/product.service";


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
  vendorProfileId: string; 
  vendorProfile?: {
    cancellationRate: number;
    avgRating: number;
    qualityScore: number;
    shippingScore: number;
    followerCount: number;
    storeName: string;
    isVerified: boolean;
    store?: {
      slug: string;
    };
  };
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
    body: string | null;
    createdAt: string;
    isVerified: boolean;
    user: { name: string | null };
  }[];
};

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  if (!slug) return notFound();

      
  const product =
    await ProductService.getProductBySlug(
      slug
    );

  if (!product) return notFound();

  const similarProducts =
  product.categoryId
    ? await ProductService.getSimilarProducts(
        product.categoryId,
        product.id
      )
    : [];

  
  const formattedProduct: ProductWithRelations = {
    ...product,
    price: Number(product.price),
    discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    category: product.category,
    images: product.images.length > 0 ? product.images : [],
    imageUrl: product.images.length > 0 ? product.images[0].url : "/logo.png",
    
    vendorProfileId: product.vendorProfileId,
    // Mapping the newly created DB fields to the Frontend
    vendorProfile: product.vendorProfile ? {
      cancellationRate: product.vendorProfile.cancellationRate ?? 0,
      avgRating: product.vendorProfile.avgRating ?? 5.0,
      qualityScore: product.vendorProfile.qualityScore ?? 100,
      shippingScore: product.vendorProfile.shippingScore ?? 100,
      followerCount: product.vendorProfile.followerCount ?? 0,
      storeName: product.vendorProfile.storeName,
      isVerified: product.vendorProfile.isVerified,
      store: product.vendorProfile.store ? {
        slug: product.vendorProfile.store.slug
      } : undefined
    } : undefined,

    variants: product.variants.map((v) => ({
      ...v,
      price: Number(v.price),
    })),

    reviews: product.reviews.map((r) => ({
      ...r,
      body: r.body,
      createdAt: r.createdAt.toISOString(),
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
    imageUrl: p.images[0]?.url || "/placeholder-image.png",
  }));

  return <ProductDetails product={formattedProduct} similarItems={formattedSimilar} />;
}