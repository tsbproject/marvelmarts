// import Link from "next/link";
// import { prisma } from "@/app/lib/prisma";

// export default async function CategoriesPage() {
//   // Fetch only top-level categories (parentId = null)
//   const categories = await prisma.category.findMany({
//     where: { parentId: null },
//     orderBy: { position: "asc" },
//     select: {
//       id: true,
//       name: true,
//       slug: true, // this is the full slug path in DB
//       children: {
//         orderBy: { position: "asc" },
//         select: {
//           id: true,
//           name: true,
//           slug: true, // children also have full slug paths
//         },
//       },
//     },
//   });

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-4xl font-bold mb-6">Categories</h1>

//       {categories.length > 0 ? (
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           {categories.map((category) => (
//             <div
//               key={category.id}
//               className="border p-4 rounded-lg shadow-sm hover:shadow-md transition"
//             >
//               {/* Main category */}
//               <Link href={`/categories/${category.slug}`}>
//                 <h2 className="text-xl font-semibold hover:underline">
//                   {category.name}
//                 </h2>
//               </Link>

//               {/* Subcategories preview */}
//               {category.children.length > 0 && (
//                 <ul className="mt-3 space-y-1 text-gray-600">
//                   {category.children.map((child) => (
//                     <li key={child.id}>
//                       <Link
//                         href={`/categories/${child.slug}`}
//                         className="hover:text-brand-primary transition-colors"
//                       >
//                         {child.name}
//                       </Link>
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </div>
//           ))}
//         </div>
//       ) : (
//         <p className="text-center text-gray-500">No categories found.</p>
//       )}
//     </div>
//   );
// }



import Link from "next/link";
import { prisma } from "@/app/lib/prisma";

// 🔹 Recursive type for clarity
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

  // 🔹 Normalize: ensure every node has children = []
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

// 🔹 Import the client component (Next.js will split bundles automatically)
import CategoriesAccordionClient from "./CategoriesAccordionClient";
