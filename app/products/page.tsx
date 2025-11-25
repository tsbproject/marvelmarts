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


import  prisma  from "@/app/_lib/prisma";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 60; // Cache API response for 60 seconds

export default async function ProductsPage() {
  let products = [];

  try {
    products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("❌ Failed to load products:", error);
    return (
      <div className="p-6 text-red-600">
        Failed to load products. Please try again later.
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="p-6 text-gray-500">
        No products found. Add some from your admin dashboard!
      </div>
    );
  }

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <Link
          href={`/products/${product.id}`}
          key={product.id}
          className="border rounded-lg p-4 hover:shadow-md transition"
        >
          <div className="relative w-full h-48 bg-gray-100 rounded-md">
            {product.imageUrl && (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover rounded-md"
              />
            )}
          </div>

          <h2 className="mt-4 font-semibold text-lg">{product.name}</h2>
          <p className="text-gray-600 text-sm">{product.description?.slice(0, 60)}...</p>

            <p className="mt-2 font-bold text-green-600">₦{product.price}</p>
          
        </Link>
      ))}
    </div>
  );
}
