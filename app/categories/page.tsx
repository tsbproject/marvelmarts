// app/categories/page.tsx
"use client"; 

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    }

    fetchCategories();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold">Categories</h1>
      <div className="mt-4">
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div key={category.id} className="border p-4 rounded-lg">
                <Link href={`/categories/${category.slug}`}>
                  <h2 className="text-xl">{category.name}</h2>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p>No categories found.</p>
        )}
      </div>
    </div>
  );
}
