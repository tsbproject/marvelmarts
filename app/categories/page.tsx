import Link from "next/link";
import { prisma } from "@/app/lib/prisma";

//Recursive type for clarity
type CategoryTree = {
  id: string;
  name: string;
  slug: string;
  children: CategoryTree[];
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
