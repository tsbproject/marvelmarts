// 'use client';

// import { useEffect, useState } from 'react';
// import Image from 'next/image';
// import Link from 'next/link';

// interface Category {
//   id: string;
//   name: string;
// }

// interface ProductImage {
//   id: string;
//   url: string;
//   alt?: string;
// }

// interface Product {
//   id: string;
//   slug: string;
//   title: string;
//   description: string;
//   price: number;
//   category?: Category | null;
//   images?: ProductImage[];
// }

// export default function ProductsPage() {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         const res = await fetch('/api/products');
//         if (!res.ok) throw new Error('Failed to fetch products');
//         const data = await res.json();
//         setProducts(data);
//       } catch (err) {
//         console.error(err);
//         setError('Unable to load products. Please try again later.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProducts();
//   }, []);

//   if (loading) return <div className="p-4 text-center">Loading products...</div>;
//   if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-4xl font-bold mb-6">Products</h1>

//       {products.length > 0 ? (
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           {products.map((product) => (
//             <div key={product.id} className="border p-4 rounded-lg shadow-sm">
//               <Link href={`/products/${product.slug}`}>
//                 <h2 className="text-xl font-semibold hover:underline">{product.title}</h2>
//               </Link>

//               <p className="text-gray-600 mt-1">{product.description}</p>

//               {product.category && (
//                 <p className="text-sm text-gray-500 mt-1">
//                   Category: {product.category.name}
//                 </p>
//               )}

//               <p className="text-lg font-bold text-green-600 mt-2">
//                 ₦{product.price.toLocaleString()}
//               </p>

//               {product.images && product.images.length > 0 && (
//                 <div className="mt-3">
//                   <Image
//                     src={product.images[0].url}
//                     alt={product.images[0].alt ?? product.title}
//                     width={400}
//                     height={250}
//                     className="w-full h-48 object-cover rounded"
//                     onError={(e) => {
//                       (e.target as HTMLImageElement).src = '/placeholder.jpg';
//                     }}
//                   />
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       ) : (
//         <p className="text-center text-gray-500">No products found.</p>
//       )}
//     </div>
//   );
// }


import Link from "next/link";
import prisma from "@/app/lib/prisma";
import Image from "next/image";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      images: true,
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });

  if (products.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">All Products</h1>
        <p className="text-gray-500">No products available.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">All Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((product) => {
          const thumbnail =
            product.images.length > 0
              ? product.images[0].url
              : "https://via.placeholder.com/400x300?text=No+Image";

          return (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="block border rounded-lg p-4 hover:shadow-lg transition"
            >
              <Image
                src={thumbnail}
                alt={product.title}
                width={400}
                height={300}
                className="rounded object-cover w-full h-auto mb-3"
              />
              <h2 className="text-xl font-semibold mb-2">{product.title}</h2>
              <p className="text-gray-600 mb-2 line-clamp-2">
                {product.description}
              </p>
              <p className="text-green-600 font-bold">
                ₦
                {Number(product.price).toLocaleString("en-NG", {
                  minimumFractionDigits: 2,
                })}
              </p>
              {product.category && (
                <p className="text-sm text-gray-500 mt-1">
                  {product.category.name}
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}