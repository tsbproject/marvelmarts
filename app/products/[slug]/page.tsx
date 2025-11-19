// app/products/page.tsx
import { prisma } from '@/app/_lib/prisma';

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
    },
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold">Products</h1>
      <div className="mt-4">
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {products.map((product) => (
              <div key={product.id} className="border p-4 rounded-lg">
                <h2 className="text-xl">{product.title}</h2>
                <p>{product.description}</p>
                <span className="text-lg font-semibold">${product.price}</span>
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