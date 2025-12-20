// app/categories/[slug]/page.tsx
import { prisma } from "@/app/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

interface CategoryPageProps {
  params: { slug: string }; // ✅ slug is required
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const slug = params.slug;

  if (!slug) {
    notFound(); // ✅ guard against missing slug
  }

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        orderBy: { createdAt: "desc" },
        include: { images: true, variants: true },
      },
      children: true,
    },
  });

  if (!category) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold">{category.name}</h1>
      {/* render children + products here */}
    </div>
  );
}
