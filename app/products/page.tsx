import  prisma  from "@/app/lib/prisma";
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

            <p className="mt-2 font-bold text-green-600">₦{product.price.toString()}</p>

          
        </Link>
      ))}
    </div>
  );
}
