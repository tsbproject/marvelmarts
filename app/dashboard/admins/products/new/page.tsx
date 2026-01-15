"use client";

import { useState, useEffect } from "react"; // Added hooks
import ProductForm from "@/app/_components/ProductForm";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
  const router = useRouter();
  
  // 1. State for categories
  const [categories, setCategories] = useState([]);

  // 2. Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (res.ok) {
          setCategories(data);
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    }
    fetchCategories();
  }, []);

  const handleCreate = async (formData: FormData) => {
    const res = await fetch("/api/products", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      router.push("/dashboard/admins/products");
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.message || "Something went wrong");
    }
  };

  // 3. Pass the categories prop to the form
  return <ProductForm onSubmit={handleCreate} categories={categories} />;
}