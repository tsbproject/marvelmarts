import Link from "next/link";
import { prisma } from "@/app/lib/prisma";

export default async function CategoriesPage() {
  // 🔹 Fetch categories directly on the server
  const categories = await prisma.category.findMany({
    orderBy: { position: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-6">Categories</h1>

      {categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="border p-4 rounded-lg shadow-sm hover:shadow-md transition"
            >
              <Link href={`/categories/${category.slug}`}>
                <h2 className="text-xl font-semibold hover:underline">
                  {category.name}
                </h2>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No categories found.</p>
      )}
    </div>
  );
}
