// app/products/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Category {
  id: string;
  name: string;
}

interface ProductImage {
  id: string;
  url: string;
  alt?: string;
}

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category?: Category | null;
  images?: ProductImage[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold">Products</h1>
      <div className="mt-4">
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {products.map((product) => (
              <div key={product.id} className="border p-4 rounded-lg">
                <h2 className="text-xl font-semibold">{product.title}</h2>
                <p className="text-gray-600">{product.description}</p>
                {product.category && (
                  <p className="text-sm text-gray-500">Category: {product.category.name}</p>
                )}
                {product.images && product.images.length > 0 && (
                  <div className="mt-2">
                    <Image
                      src={product.images[0].url}
                      alt={product.images[0].alt ?? product.title}
                      width={200}
                      height={100}
                      className="w-full h-48 object-cover rounded"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No products found.</p>
        )}
      </div>
    </div>
  );
}
