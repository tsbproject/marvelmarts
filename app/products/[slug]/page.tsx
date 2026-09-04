export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductDetails from "./ProductDetails";
import ProductUnavailable from "./ProductUnavailable";
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


const SITE_URL = "https://marvelmarts.com";

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;

  if (!slug) {
    return {
      title: "Product | MarvelMarts",
      description:
        "Discover quality products from trusted Nigerian merchants on MarvelMarts.",
    };
  }

  const product = await ProductService.getProductBySlug(slug, {
      includeUnavailable: true,
    });

  if (!product) {
    return {
      title: "Product Not Found | MarvelMarts",
      description:
        "The product you are looking for could not be found on MarvelMarts.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = product.title?.trim() || "Product";
  const description =
    product.description?.trim() ||
    `Shop ${title} on MarvelMarts and discover quality products from trusted Nigerian merchants.`;


    const isProductUnavailable =
      product.vendorProfile.isSuspended ||
      product.vendorProfile.status !== "APPROVED";

  const image =
    product.images?.[0]?.url || `${SITE_URL}/logo-512-x-512.png`;

  const canonicalUrl = `${SITE_URL}/products/${product.slug}`;

  return {
    title,
    description,

    alternates: {
      canonical: canonicalUrl,
    },

    openGraph: {
      type: "website",
      locale: "en_NG",
      url: canonicalUrl,
      siteName: "MarvelMarts",
      title,
      description,
      images: [
        {
          url: image,
          alt: title,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },

    robots: {
    index: product.isPublished && !isProductUnavailable,
    follow: product.isPublished && !isProductUnavailable,
    googleBot: {
      index: product.isPublished && !isProductUnavailable,
      follow: product.isPublished && !isProductUnavailable,
      "max-image-preview": "large",
    },
  },
  };
}




function buildProductJsonLd(product: ProductWithRelations) {
  const price =
    product.discountPrice && product.discountPrice > 0
      ? product.discountPrice
      : product.price;

  const reviewCount = product.reviews.length;

  const averageRating =
    reviewCount > 0
      ? product.reviews.reduce(
          (sum, review) => sum + review.rating,
          0
        ) / reviewCount
      : null;

  const availability =
    product.stock > 0
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock";

  return {
    "@context": "https://schema.org",
    "@type": "Product",

    name: product.title,

    description:
      product.description?.trim() ||
      `Shop ${product.title} on MarvelMarts.`,

    image:
      product.images.length > 0
        ? product.images.map((image) => image.url)
        : ["https://marvelmarts.com/logo-512-x-512.png"],

    ...(product.brand
      ? {
          brand: {
            "@type": "Brand",
            name: product.brand,
          },
        }
      : {}),

    sku:
      product.variants.find((variant) => variant.sku)?.sku ??
      undefined,

    offers: {
      "@type": "Offer",
      url: `https://marvelmarts.com/products/${product.slug}`,
      priceCurrency: "NGN",
      price: price.toFixed(2),
      availability,
      itemCondition:
        "https://schema.org/NewCondition",
    },

    ...(averageRating !== null
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: averageRating.toFixed(1),
            reviewCount,
            bestRating: "5",
            worstRating: "1",
          },
        }
      : {}),
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  if (!slug) return notFound();

      
  const product =
  await ProductService.getProductBySlug(
    slug,
    {
      includeUnavailable: true,
    }
  );

  if (!product) return notFound();

  const isProductUnavailable =
    product.vendorProfile.isSuspended ||
    product.vendorProfile.status !== "APPROVED";

  if (isProductUnavailable) {
    const unavailableImage =
    product.images?.[0]?.url || null;

    return (
      <ProductUnavailable
        title={product.title}
        imageUrl={unavailableImage}
      />
    );
  }

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

  const productJsonLd = buildProductJsonLd(formattedProduct);

return (
  <>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(productJsonLd).replace(
          /</g,
          "\\u003c"
        ),
      }}
    />

    <ProductDetails
      product={formattedProduct}
      similarItems={formattedSimilar}
    />
  </>
);
}