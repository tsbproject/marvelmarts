// "use client";

// import ProductForm from "@/app/_components/ProductForm";
// import { useRouter } from "next/navigation";

// export default function NewProductPage() {
//   const router = useRouter();

//   async function handleCreate(fd: FormData) {
//     const res = await fetch("/api/products", {
//       method: "POST",
//       body: fd,
//     });
//     if (!res.ok) throw new Error("Failed to create product");
//     const product = await res.json();
//     router.push(`/dashboard/admins/products/${product.slug}`);
//   }

//   return (
//     <div className="p-8">
//       <h1 className="text-2xl font-bold mb-6">Create Product</h1>
//       <ProductForm onSubmit={handleCreate} />
//     </div>
//   );
// }



"use client";

import { useRouter } from "next/navigation";
import ProductForm from "@/app/_components/ProductForm";

export default function NewProductPage() {
  const router = useRouter();

  async function handleCreate(fd: FormData) {
    const res = await fetch("/api/products", {
      method: "POST",
      body: fd,
    });
    if (!res.ok) throw new Error("Failed to create product");
    const product = await res.json();
    router.push(`/dashboard/admins/products/${product.slug}`);
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Create Product</h1>
      <ProductForm onSubmit={handleCreate} />
    </div>
  );
}

