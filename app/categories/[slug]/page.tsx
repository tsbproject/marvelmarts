// app/categories/[slug]/page.tsx
import { prisma } from '@/app/_lib/prisma';
import { notFound } from 'next/navigation';

interface CategoryPageProps {
  params: { slug: string };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = params;

  // Fetch category by slug including its products
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        include: {
          images: true,
          variants: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!category) {
    notFound(); // 404 if category doesn't exist
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold">{category.name}</h1>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {category.products.length === 0 ? (
          <p>No products found in this category.</p>
        ) : (
          category.products.map((product) => (
            <div key={product.id} className="border p-4 rounded-lg">
              <h2 className="text-xl font-semibold">{product.title}</h2>
              <p className="text-gray-600">{product.description}</p>
              <span className="text-lg font-bold">${product.price.toFixed(2)}</span>
              {product.images.length > 0 && (
                <img
                  src={product.images[0].url}
                  alt={product.images[0].alt || product.title}
                  className="mt-2 w-full h-40 object-cover rounded"
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
