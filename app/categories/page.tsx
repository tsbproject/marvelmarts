import { prisma } from "@/app/lib/prisma";
import type { Metadata } from "next";


//Recursive type for clarity
type CategoryTree = {
  id: string;
  name: string;
  slug: string;
  children: CategoryTree[];
};


export const metadata: Metadata = {
  title: "Shop by Category",
  description:
    "Explore MarvelMarts product categories and discover fashion, electronics, beauty, home essentials and more from trusted Nigerian merchants.",
  alternates: {
    canonical: "/categories",
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    title: "Shop by Category | MarvelMarts",
    description:
      "Explore product categories and discover quality products from trusted Nigerian merchants on MarvelMarts.",
    url: "/categories",
    siteName: "MarvelMarts",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop by Category | MarvelMarts",
    description:
      "Explore product categories and discover quality products from trusted Nigerian merchants on MarvelMarts.",
  },
};

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { position: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      children: {
        orderBy: { position: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          children: {
            orderBy: { position: "asc" },
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  //Normalize: ensure every node has children = []
  const normalize = (cats: any[]): CategoryTree[] =>
    cats.map((c: any) => ({
      ...c,
      children: normalize(c.children ?? []),
    }));

  const normalizedCategories = normalize(categories);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-6">Categories</h1>

      {normalizedCategories.length > 0 ? (
        <div className="space-y-4">
          <CategoriesAccordionClient categories={normalizedCategories} />
        </div>
      ) : (
        <p className="text-center text-gray-500">No categories found.</p>
      )}
    </div>
  );
}

//Import the client component (Next.js will split bundles automatically)
import CategoriesAccordionClient from "./CategoriesAccordionClient";
