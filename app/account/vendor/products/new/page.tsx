// import { useEffect, useState } from "react";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/lib/auth";
// import DashboardHeader from "@/app/_components/DashboardHeader";
// import ProductForm from "@/app/_components/ProductForm";
// import { ArrowLeft } from "lucide-react";
// import { redirect } from "next/navigation";
// import prisma from "@/app/lib/prisma"; 

// export default async function NewProductPage() {
//   const session = await getServerSession(authOptions);

//    // 1. State for categories
//     const [categories, setCategories] = useState([]);

//   // Security Check
//   if (!session || session.user.role !== "VENDOR") {
//     redirect("/auth/signin");
//   }

//   // 2. Fetch categories on mount
//    useEffect(() => {
//      async function fetchCategories() {
//        try {
//          const res = await fetch("/api/categories");
//          const data = await res.json();
//          if (res.ok) {
//            setCategories(data);
//          }
//        } catch (err) {
//          console.error("Failed to fetch categories", err);
//        }
//      }
//      fetchCategories();
//    }, []);
//   async function handleCreateProduct(formData: FormData) {
//     "use server";
//     // Your submission logic here
//   }

//   return (
//     <div className="flex flex-col min-h-screen">
//       <DashboardHeader 
//         title="List New Product" 
//         showSecondaryButton={true}
//         secondaryButtonLabel="Back to Inventory"
//         secondaryButtonLink="/account/vendor/products"
//         secondaryButtonIcon={<ArrowLeft size={16} />}
//       />

//       <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
//         <div className="bg-neutral-white rounded-4xl border border-gray-100 shadow-xl p-8">
//           <div className="mb-10">
//             <h2 className="text-2xl font-black text-accent-navy uppercase tracking-tight">Product Details</h2>
//             <p className="text-neutral-gray font-medium">Your product will be automatically linked to <strong>{session.user.name}</strong></p>
//           </div>

//           {/* 2. Pass the fetched categories to the form */}
//           <ProductForm 
//             vendorId={session.user.id} 
//             onSubmit={handleCreateProduct} 
//             categories={categories} 
//           />
//         </div>
//       </div>
//     </div>
//   );
// }





"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/app/_components/DashboardHeader";
import ProductForm from "@/app/_components/ProductForm";
import { ArrowLeft } from "lucide-react";

// IMPORTANT: Move your product submission logic to a separate file 
// (e.g., @/app/actions/product.ts) and import it here.
// import { createProductAction } from "@/app/actions/product";

export default function NewProductPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState([]);

  // 1. Fetch categories on mount
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

  // 2. Handle Authentication & Authorization
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated" && session?.user?.role !== "VENDOR") {
      router.push("/"); // Redirect non-vendors away
    }
  }, [status, session, router]);

  // Show loading state while checking session
  if (status === "loading") {
    return <div className="p-10 text-center">Loading...</div>;
  }

  if (!session || session.user.role !== "VENDOR") {
    return null; // Prevent flicker before redirect
  }

  // Handle Submit (This should call your server action or an API route)
  const handleCreateProduct = async (formData: FormData) => {
    try {
      // Example calling an API route:
      const res = await fetch("/api/products", {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) throw new Error("Failed to save");
      router.push("/account/vendor/products");
    } catch (err) {
      console.error(err);
      throw err; // Let ProductForm handle the error UI
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader 
        title="List New Product" 
        showSecondaryButton={true}
        secondaryButtonLabel="Back to Inventory"
        secondaryButtonLink="/account/vendor/products"
        secondaryButtonIcon={<ArrowLeft size={16} />}
      />

      <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
        <div className="bg-neutral-white rounded-4xl border border-gray-100 shadow-xl p-8">
          <div className="mb-10">
            <h2 className="text-2xl font-black text-accent-navy uppercase tracking-tight">Product Details</h2>
            <p className="text-neutral-gray font-medium">
              Your product will be automatically linked to <strong>{session.user.name}</strong>
            </p>
          </div>

          <ProductForm 
            vendorId={session.user.id} 
            onSubmit={handleCreateProduct} 
            categories={categories} 
          />
        </div>
      </div>
    </div>
  );
}