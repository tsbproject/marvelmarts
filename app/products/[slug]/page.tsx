// // app/products/page.tsx
// import { prisma } from '@/app/_lib/prisma';

// export default async function ProductsPage() {
//   const products = await prisma.product.findMany({
//     orderBy: { createdAt: 'desc' },
//     select: {
//       id: true,
//       title: true,
//       description: true,
//       price: true,
//     },
//   });

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-4xl font-bold">Products</h1>
//       <div className="mt-4">
//         {products.length > 0 ? (
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             {products.map((product) => (
//               <div key={product.id} className="border p-4 rounded-lg">
//                 <h2 className="text-xl">{product.title}</h2>
//                 <p>{product.description}</p>
//                 <span className="text-lg font-semibold">${product.price}</span>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <p>No products found.</p>
//         )}
//       </div>
//     </div>
//   );
// }



import { notFound } from 'next/navigation';
import { getPrisma } from '@/app/_lib/prisma';
import Image from 'next/image';

interface Props {
  params: { slug: string };
}

export default async function ProductPage({ params }: Props) {
  const prisma = await getPrisma();

  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      category: { select: { id: true, name: true } },
      images: true,
      variants: true,
    },
  });

  if (!product) return notFound();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
      <p className="text-gray-700 mb-4">{product.description}</p>

      {product.category && (
        <p className="text-sm text-gray-500 mb-2">
          Category: {product.category.name}
        </p>
      )}

      <p className="text-xl font-bold text-green-600 mb-4">
        ₦{product.price.toLocaleString()}
      </p>

      {product.images && product.images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {product.images.map((img) => (
            <Image
              key={img.id}
              src={img.url}
              alt={img.alt ?? product.title}
              width={600}
              height={400}
              className="rounded object-cover w-full h-auto"
            />
          ))}
        </div>
      )}

      {product.variants && product.variants.length > 0 && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Variants</h2>
          <ul className="list-disc pl-5">
            {product.variants.map((variant) => (
              <li key={variant.id}>
                {variant.name} — ₦{variant.price.toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}