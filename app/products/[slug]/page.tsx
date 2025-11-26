


import { notFound } from "next/navigation";
import prisma from "@/app/lib/prisma";
import Image from "next/image";
import type { Product, Category, ProductImage, Variant } from "@prisma/client";

interface Props {
  params: { slug: string };
}

interface ProductWithRelations extends Product {
  category: Category | null;
  images: ProductImage[];
  variants: Variant[];
}

export default async function ProductPage({ params }: Props) {
  if (!params?.slug) return notFound();

  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      category: true,
      images: true,   // ✅ matches schema
      variants: true,
    },
  });

  if (!product) return notFound();

  const typedProduct = product as ProductWithRelations;

  // ✅ Local fallback image (better than external placeholder)
  const fallbackImage: ProductImage = {
    id: "placeholder",
    productId: typedProduct.id,
    url: "/no-image.png", // place a file in /public/no-image.png
    alt: "No image available",
    position: 0,
  };

  const imagesToShow =
    typedProduct.images.length > 0 ? typedProduct.images : [fallbackImage];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-2">{typedProduct.title}</h1>
      <p className="text-gray-700 mb-4">{typedProduct.description}</p>

      {typedProduct.category && (
        <p className="text-sm text-gray-500 mb-2">
          Category: {typedProduct.category.name}
        </p>
      )}

      <p className="text-xl font-bold text-green-600 mb-4">
        ₦
        {Number(typedProduct.price).toLocaleString("en-NG", {
          minimumFractionDigits: 2,
        })}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {imagesToShow.map((img) => (
          <Image
            key={img.id}
            src={img.url}
            alt={img.alt ?? typedProduct.title}
            width={600}
            height={400}
            className="rounded object-cover w-full h-auto"
          />
        ))}
      </div>

      {typedProduct.variants.length > 0 && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Variants</h2>
          <ul className="list-disc pl-5">
            {typedProduct.variants.map((variant) => (
              <li key={variant.id}>
                {variant.name} — ₦
                {Number(variant.price).toLocaleString("en-NG", {
                  minimumFractionDigits: 2,
                })}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}