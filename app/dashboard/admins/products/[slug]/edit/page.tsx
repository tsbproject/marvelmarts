import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import ProductFormParent from "./ProductFormParent"; // We'll create this helper

export default async function EditProductPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;

  // Fetch product with images and category
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { order: "asc" } },
      category: true,
    },
  });

  if (!product) notFound();

  // Clean data for the client
  const initialData = {
    ...product,
    price: Number(product.price),
    discountPrice: product.discountPrice ? Number(product.discountPrice) : null,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <ProductFormParent initialData={initialData} />
    </div>
  );
}