"use client";

import { useRouter } from "next/navigation";
import ProductForm from "@/app/_components/ProductForm";

export default function NewProductPage() {
  const router = useRouter();

  async function handleCreate(fd: FormData) {
    // Send FormData directly, do not convert to JSON
    const res = await fetch("/api/products", {
      method: "POST",
      body: fd,
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
