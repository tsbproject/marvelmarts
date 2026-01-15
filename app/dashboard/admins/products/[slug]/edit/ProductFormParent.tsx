"use client";

import { useState, useEffect } from "react"; // Added hooks
import ProductForm from "@/app/_components/ProductForm";
import { useRouter } from "next/navigation";
import { useNotification } from "@/app/_context/NotificationContext";

export default function ProductFormParent({ initialData }: { initialData: any }) {
  const router = useRouter();
  const { notifySuccess, notifyError } = useNotification();
  
  // 1. Add state to hold categories
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

  const handleUpdate = async (formData: FormData) => {
    try {
      const res = await fetch(`/api/products?id=${initialData.id}`, {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      notifySuccess("Product updated successfully!");
      router.push("/dashboard/admins/products");
      router.refresh();
    } catch (err: any) {
      notifyError(err.message);
    }
  };

  // 3. Pass categories to the ProductForm
  return (
    <ProductForm 
      onSubmit={handleUpdate} 
      initialData={initialData} 
      categories={categories} 
    />
  );
}