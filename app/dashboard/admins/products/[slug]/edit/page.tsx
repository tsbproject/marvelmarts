"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

interface Product {
  id: string;
  slug: string;
  title: string;
  description?: string;
  price: number;
  discountPrice?: number;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  categoryId?: string;
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const slugParam = params?.slug;

  if (typeof slugParam !== "string") {
    return <p>Invalid product slug</p>;
  }

  const slug = slugParam;
  const [product, setProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<Partial<Product>>({});

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setForm(data);
      })
      .catch((err) => console.error("Error fetching product:", err));
  }, [slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/products/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      alert("Product updated successfully!");
      router.push(`/dashboard/admins/products/${slug}`);
    } else {
      alert("Error updating product");
    }
  }

  if (!product) return <p>Loading...</p>;

  return (
    <div className="p-8 w-full">
      <h1 className="text-xl font-bold mb-4">Edit Product</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          value={form.title ?? ""}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="input w-full"
        />

        <textarea
          placeholder="Description"
          value={form.description ?? ""}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="textarea w-full"
        />

        <input
          type="number"
          placeholder="Price"
          value={form.price ?? 0}
          onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
          className="input w-full"
        />

        <input
          type="number"
          placeholder="Discount Price"
          value={form.discountPrice ?? 0}
          onChange={(e) =>
            setForm({ ...form, discountPrice: Number(e.target.value) })
          }
          className="input w-full"
        />

        <select
          value={form.status ?? "ACTIVE"}
          onChange={(e) =>
            setForm({ ...form, status: e.target.value as Product["status"] })
          }
          className="select w-full"
        >
          <option value="ACTIVE">Active</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </select>

        <button type="submit" className="btn btn-primary">
          Save Changes
        </button>
      </form>
    </div>
  );
}
