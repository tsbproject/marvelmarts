"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ImagesTab } from "./components/ImagesTab";
import { VariantsTab } from "./components/VariantsTab";
import { ReviewsTab } from "./components/ReviewsTab";

type Tab = "overview" | "images" | "variants" | "reviews";

interface Product {
  id: string;
  slug: string;
  title: string;
  description?: string;
  price: number;
  status: string;
  category?: { id: string; name: string };
}

export default function ProductDetailPage() {
  const params = useParams();
  const slugParam = params?.slug;

  if (typeof slugParam !== "string") {
    return <p>Invalid product slug</p>;
  }

  const slug = slugParam;
  const [product, setProduct] = useState<Product | null>(null);
  const [tab, setTab] = useState<Tab>("overview");

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then((res) => res.json())
      .then(setProduct)
      .catch((err) => console.error("Error fetching product:", err));
  }, [slug]);

  if (!product) return <p>Loading...</p>;

  return (
    <div className="p-8 w-full">
      <h1 className="text-xl font-bold mb-4">{product.title}</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-4">
        {(["overview", "images", "variants", "reviews"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`btn ${tab === t ? "btn-primary" : "btn-secondary"}`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "overview" && (
        <div>
          <p>{product.description}</p>
          <p>Price: ${product.price}</p>
          <p>Status: {product.status}</p>
          {product.category && <p>Category: {product.category.name}</p>}
        </div>
      )}

      {tab === "images" && <ImagesTab slug={slug} />}
      {tab === "variants" && <VariantsTab slug={slug} />}
      {tab === "reviews" && <ReviewsTab slug={slug} />}
    </div>
  );
}
