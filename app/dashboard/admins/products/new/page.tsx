"use client";

import { useRouter } from "next/navigation";
import ProductForm from "@/app/_components/ProductForm";

export default function NewProductPage() {
  const router = useRouter();

  async function handleCreate(fd: FormData) {
    // Convert FormData into a plain object
    const obj: Record<string, any> = {};
    fd.forEach((value, key) => {
      // handle arrays if needed (e.g. images[], variants[])
      if (obj[key]) {
        if (Array.isArray(obj[key])) {
          obj[key].push(value);
        } else {
          obj[key] = [obj[key], value];
        }
      } else {
        obj[key] = value;
      }
    });

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(obj),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Product creation failed:", res.status, text);
      throw new Error("Failed to create product");
    }

    const product = await res.json();
    router.push(`/dashboard/admins/products/${product.slug}`);
  }

  return (
    <div className="flex justify-center items-center p-5 max-w-4xl md:max-w-600">
      <ProductForm onSubmit={handleCreate} />
    </div>
  );
}
