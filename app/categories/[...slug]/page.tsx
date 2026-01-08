




// import { prisma } from "@/app/lib/prisma";
// import { notFound } from "next/navigation";
// import Link from "next/link";
// import Image from "next/image";
// import type { Prisma } from "@prisma/client";

// type CategoryWithRelations = Prisma.CategoryGetPayload<{
//   include: {
//     children: true;
//     products: { include: { images: true; variants: true } };
//   };
// }>;

// export default async function CategoryPage({
//   params,
// }: {
//   params: { slug?: string[] };
// }) {
//   if (!params.slug || params.slug.length === 0) {
//     notFound(); // `/categories` handled separately in app/categories/page.tsx
//   }

//   const slugPath = params.slug.join("/");

//   const category: CategoryWithRelations | null = await prisma.category.findUnique({
//     where: { slug: slugPath },
//     include: {
//       children: true,
//       products: { include: { images: true, variants: true } },
//     },
//   });

//   if (!category) notFound();

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-3xl font-bold">{category.name}</h1>

//       {/* Subcategories */}
//       {category.children?.length > 0 && (
//         <div className="mt-6">
//           <h2 className="text-xl font-semibold">Subcategories</h2>
//           <ul className="grid grid-cols-2 gap-4 mt-4">
//             {category.children.map((child) => (
//               <li key={child.id}>
//                 <Link
//                   href={`/categories/${child.slug}`}
//                   className="block p-4 bg-gray-100 rounded hover:bg-gray-200"
//                 >
//                   {child.name}
//                 </Link>
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}

//       {/* Products */}
//       {category.products?.length > 0 && (
//         <div className="mt-6">
//           <h2 className="text-xl font-semibold">Products</h2>
//           <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-4">
//             {category.products.map((product) => (
//               <Link
//                 key={product.id}
//                 href={`/products/${product.slug}`}
//                 className="block border rounded overflow-hidden hover:shadow-lg"
//               >
//                 {product.images?.[0] && (
//                   <Image
//                     src={product.images[0].url}
//                     alt={product.title}
//                     width={400}
//                     height={300}
//                     className="object-cover w-full h-48"
//                   />
//                 )}
//                 <div className="p-2">
//                   <h3 className="font-medium">{product.title}</h3>
//                   {product.variants?.[0]?.price && (
//                     <p className="text-sm text-gray-600">
//                       {product.variants[0].price.toString()} USD
//                     </p>
//                   )}
//                 </div>
//               </Link>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Prisma } from "@prisma/client";

type CategoryWithRelations = Prisma.CategoryGetPayload<{
  include: {
    children: true;
    products: {
      include: {
        images: true;
        variants: true;
      };
    };
  };
}>;

type PageProps = {
  params: {
    slug: string[];
  };
};

export default async function CategoryPage({ params }: PageProps) {
  // Safety check (should never happen with [...slug])
  if (!params.slug?.length) notFound();

  const slugPath = params.slug.join("/");

  const category: CategoryWithRelations | null =
    await prisma.category.findUnique({
      where: { slug: slugPath },
      include: {
        children: true,
        products: {
          include: {
            images: true,
            variants: true,
          },
        },
      },
    });

  if (!category) notFound();

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold">{category.name}</h1>

      {/* Subcategories */}
      {category.children.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Subcategories</h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {category.children.map((child) => (
              <li key={child.id}>
                <Link
                  href={`/categories/${child.slug}`}
                  className="block p-4 bg-gray-100 rounded hover:bg-gray-200 transition"
                >
                  {child.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Products */}
      {category.products.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {category.products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="border rounded overflow-hidden bg-white hover:shadow-md transition"
              >
                {product.images?.[0] && (
                  <Image
                    src={product.images[0].url}
                    alt={product.title}
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover"
                  />
                )}

                <div className="p-3">
                  <h3 className="font-medium">{product.title}</h3>
                  {product.variants?.[0]?.price && (
                    <p className="text-sm text-gray-600 mt-1">
                      ₦{Number(product.variants[0].price).toLocaleString()}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
