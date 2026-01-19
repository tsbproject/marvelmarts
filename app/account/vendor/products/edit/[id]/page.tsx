
"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import DashboardHeader from "@/app/_components/DashboardHeader";
import ProductForm from "@/app/_components/ProductForm"; 
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Guard: Wait for session to load
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    async function initPage() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch(`/api/products?id=${id}`),
          fetch("/api/categories") 
        ]);

        const prodData = await prodRes.json();
        const catData = await catRes.json();

        // Check Product Response
        if (prodRes.ok && prodData.product) {
          setProduct(prodData.product);
        } else {
          setError(prodData.message || "Product not found.");
        }

        // Check Categories Response
        // Note: Using 'catData.categories' OR 'catData' depending on your API structure
        if (catRes.ok) {
          const fetchedCats = Array.isArray(catData) ? catData : catData.categories;
          setCategories(fetchedCats || []);
        }

      } catch (err) {
        setError("Failed to load page data.");
      } finally {
        setLoading(false);
      }
    }

    initPage();
  }, [id, status, router]);

  const handleUpdate = async (formData: FormData) => {
    try {
      const res = await fetch(`/api/products?id=${id}`, {
        method: "PUT",
        body: formData,
      });

      const result = await res.json();

      if (res.ok && result.success) {
        router.push("/account/vendor/products");
        router.refresh(); 
      } else {
        throw new Error(result.message || "Failed to update");
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-light gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-brand-primary" />
        <p className="font-black text-accent-navy uppercase tracking-widest text-xs">Loading Store Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-light p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-accent-navy mb-2">Oops!</h2>
        <p className="text-neutral-gray mb-6">{error}</p>
        <Link href="/account/vendor/products" className="bg-accent-navy text-white px-6 py-3 rounded-xl font-bold">
          Back to Inventory
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-neutral-light">
      <DashboardHeader title="Edit Listing" showLogout={true} />
      
      <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
        <div className="mb-8">
          <Link 
            href="/account/vendor/products" 
            className="inline-flex items-center gap-2 text-neutral-gray hover:text-brand-primary font-black uppercase text-[10px] tracking-[0.2em] transition-all"
          >
            <ArrowLeft size={14} /> Back to Products
          </Link>
        </div>

        {/* Ensure your normalizeProductData helper inside ProductForm 
            correctly extracts category IDs from the product object.
        */}
        <ProductForm 
          initialData={product} 
          categories={categories}
          onSubmit={handleUpdate} 
          vendorId={session?.user?.id}
        />
      </div>
    </div>
  );
}