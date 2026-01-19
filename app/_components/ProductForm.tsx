// "use client";

// import React, { useEffect, useId, useReducer, useState, useMemo } from "react";
// import Select from "react-select";
// import {
//   TagIcon,
//   CurrencyDollarIcon,
//   Squares2X2Icon,
//   PhotoIcon,
//   ArchiveBoxIcon,
//   ArrowPathIcon,
//   StarIcon,
//   CheckBadgeIcon,
//   TruckIcon
// } from "@heroicons/react/24/outline";
// import { mapCategoriesToOptions } from "@/app/lib/MapCategoriesToOptions";
// import { normalizeProductData } from "@/app/lib/normalizeProductData";
// import RichTextEditor from "./RichTextEditor";

// // --- Types ---
// interface Category {
//   id: string;
//   name: string;
//   parentId?: string | null;
// }

// interface ProductFormProps {
//   onSubmit: (payload: FormData) => Promise<void>;
//   initialData?: any; 
//   categories: Category[]; 
//   vendorId?: string;
// }

// // --- Helpers ---
// function formatNaira(value: number) {
//   if (!value) return "";
//   return new Intl.NumberFormat("en-NG", {
//     style: "currency",
//     currency: "NGN",
//     minimumFractionDigits: 0,
//   }).format(value);
// }

// function parseNaira(input: string) {
//   const digits = input.replace(/[^\d]/g, "");
//   return digits ? Number(digits) : 0;
// }

// export type ProductFormState = {
//   title: string;
//   description: string;
//   price: number;
//   discountPrice: number;
//   status: string;
//   isFeatured: boolean;
//   categories: string[]; // Stores IDs
//   sku: string;
//   stock: number;
//   brand: string;
//   tags: string[];
//   shippingMethod: string;
//   weight: number;
//   mainImage: File | string | null;
//   extraImages: (File | string)[];
//   metaTitle: string;
//   metaDescription: string;
// };

// type FormAction =
//   | { type: "SET_FIELD"; field: keyof ProductFormState; value: any }
//   | { type: "SET_MAIN_IMAGE"; file: File }
//   | { type: "SET_EXTRA_IMAGES"; files: File[] }
//   | { type: "RESET" };

// const initialFormState: ProductFormState = {
//   title: "",
//   description: "",
//   price: 0,
//   discountPrice: 0,
//   status: "ACTIVE",
//   isFeatured: false,
//   categories: [],
//   sku: "",
//   stock: 0,
//   brand: "",
//   tags: [],
//   shippingMethod: "Standard",
//   weight: 0,
//   mainImage: null,
//   extraImages: [],
//   metaTitle: "",
//   metaDescription: "",
// };

// function formReducer(state: ProductFormState, action: FormAction): ProductFormState {
//   switch (action.type) {
//     case "SET_FIELD":
//       return { ...state, [action.field]: action.value };
//     case "SET_MAIN_IMAGE":
//       return { ...state, mainImage: action.file };
//     case "SET_EXTRA_IMAGES":
//       return { ...state, extraImages: action.files };
//     case "RESET":
//       return initialFormState;
//     default:
//       return state;
//   }
// }


// export default function ProductForm({ onSubmit, initialData, categories = [], vendorId }: ProductFormProps) {
//   const [form, dispatch] = useReducer(formReducer, initialData ? normalizeProductData(initialData) : initialFormState);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [previewMain, setPreviewMain] = useState<string | null>(null);
//   const [previewExtras, setPreviewExtras] = useState<string[]>([]);
//   const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
//   const selectInstanceId = useId();
//   const [isDraggingMain, setIsDraggingMain] = useState(false);
//   const [isDraggingExtra, setIsDraggingExtra] = useState(false);

  

// //   // --- Category Search & Selection Fix ---
// //   // 1. Group the categories (Parent > Child)
// //   const groupedOptions = useMemo(() => mapCategoriesToOptions(categories), [categories]);
  
// //   // 2. Create a flat list so react-select can match the IDs in 'form.categories' to full objects
// //  const flatOptions = useMemo(() => {
// //   return groupedOptions.flatMap((group: any) => group.options || []);
// // }, [groupedOptions]);

// //   // 3. Map the stored IDs back to the { label, value } objects the UI needs
// //   const selectedCategoryObjects = useMemo(() => {
// //   return flatOptions.filter((opt: any) => form.categories.includes(opt.value));
// // }, [flatOptions, form.categories]);


//   const groupedOptions = mapCategoriesToOptions(categories);
//   const flatOptions = groupedOptions.flatMap((g: any) => g.options || []);
//   const selectedValue = flatOptions.filter((opt: any) => form.categories.includes(opt.value));
  

// // --- Tags logic ---
//   const [tagInput, setTagInput] = useState(form.tags.join(", "));

//   // --- Image Previews ---
//   useEffect(() => {
//     if (form.mainImage instanceof File) {
//       const url = URL.createObjectURL(form.mainImage);
//       setPreviewMain(url);
//       return () => URL.revokeObjectURL(url);
//     }
//     setPreviewMain(typeof form.mainImage === "string" ? form.mainImage : null);
//   }, [form.mainImage]);

//   useEffect(() => {
//     const urls = form.extraImages.map(img => (img instanceof File ? URL.createObjectURL(img) : (img as string)));
//     setPreviewExtras(urls);
//   }, [form.extraImages]);

//   // --- Handlers ---
//   const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const val = e.target.value;
//     setTagInput(val);
//     const tagsArray = val.split(",").map(t => t.trim()).filter(t => t !== "");
//     dispatch({ type: "SET_FIELD", field: "tags", value: tagsArray });
//   };

//   const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) dispatch({ type: "SET_FIELD", field: "mainImage", value: file });
//   };

//   const handleExtraImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = Array.from(e.target.files ?? []);
//     dispatch({ type: "SET_FIELD", field: "extraImages", value: [...form.extraImages, ...files] });
//   };

//   const removeExtraImage = (index: number) => {
//     const imgToRemove = form.extraImages[index];
//     if (typeof imgToRemove === "string" && initialData?.images) {
//       const imgObj = initialData.images.find((i: any) => i.url === imgToRemove);
//       if (imgObj) setDeletedImageIds(prev => [...prev, imgObj.id]);
//     }
//     const newExtras = [...form.extraImages];
//     newExtras.splice(index, 1);
//     dispatch({ type: "SET_FIELD", field: "extraImages", value: newExtras });
//   };

  

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     setError(null);
//     setIsSubmitting(true);

//     if (!form.title.trim()) { setError("Title is required."); setIsSubmitting(false); return; }
//     if (form.categories.length < 1) { setError("Select at least one category."); setIsSubmitting(false); return; }

//     const fd = new FormData();
//     // Standard fields
//     fd.append("title", form.title);
//     fd.append("description", form.description);
//     fd.append("price", String(form.price));
//     fd.append("discountPrice", String(form.discountPrice));
//     fd.append("status", form.status);
//     fd.append("isFeatured", String(form.isFeatured));
//     // Category ID (sending the primary category)
//     fd.append("categoryId", form.categories[form.categories.length - 1]);
//     fd.append("stock", String(form.stock));
//     fd.append("brand", form.brand);
//     fd.append("tags", JSON.stringify(form.tags));
//     fd.append("sku", form.sku);
//     fd.append("shippingMethod", form.shippingMethod);
//     fd.append("weight", String(form.weight));
//     fd.append("deletedImageIds", JSON.stringify(deletedImageIds));

//     if (vendorId) fd.append("vendorId", vendorId);
//     if (form.mainImage instanceof File) fd.append("mainImage", form.mainImage);
//     form.extraImages.forEach(img => { if (img instanceof File) fd.append("extraImages", img); });

//     try {
//       await onSubmit(fd);
//     } catch (err) {
//       setError("Error saving product.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   }


  

//   return (
//     <div className="max-w-5xl mx-auto">
//       <h1 className="text-center text-3xl md:text-5xl font-bold mb-8 text-gray-800 uppercase tracking-tighter italic">
//        {initialData ? "⚡ Update Product" : "📦 Add New Product"}
//       </h1>

//       {vendorId && (
//         <div className="mb-8 p-4 bg-slate-900 text-white rounded-3xl flex items-center justify-between border border-white/10 shadow-xl">
//           <div className="flex items-center gap-4">
//             <div className="bg-blue-500 p-2 rounded-xl"><CheckBadgeIcon className="h-6 w-6 text-white" /></div>
//             <div>
//               <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Authenticated Store Listing</p>
//               <h4 className="text-sm font-bold">Your inventory will be listed under your business profile.</h4>
//             </div>
//           </div>
//         </div>
//       )}
      
//       <form onSubmit={handleSubmit} className="space-y-10 pb-20">
//         {error && <div className="text-red-700 bg-red-50 border border-red-200 p-3 rounded sticky top-4 z-50">{error}</div>}

//         {/* Basic Info */}
//         <div className="p-6 border rounded-lg shadow-sm bg-gray-50">
//           <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-blue-700"><TagIcon className="h-6 w-6" /> Basic info</h2>
//           <label className="block text-sm font-medium mb-1">Product title</label>
//           <input type="text" value={form.title} onChange={(e) => dispatch({ type: "SET_FIELD", field: "title", value: e.target.value })} className="border rounded px-3 py-2 w-full mb-4 focus:ring-2 focus:ring-blue-500" required />
//           <label className="block text-sm font-medium mb-1">Description</label>
//           <RichTextEditor content={form.description} onChange={(html) => dispatch({ type: "SET_FIELD", field: "description", value: html })} />
//         </div>

//         {/* Pricing & Visibility */}
//         <div className="p-6 border rounded-lg shadow-sm bg-gray-50">
//           <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-green-700"><CurrencyDollarIcon className="h-6 w-6" /> Pricing & Visibility</h2>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//             <div>
//               <label className="block text-sm font-medium mb-1">Price (₦)</label>
//               <input type="text" value={form.price ? formatNaira(form.price) : ""} onChange={(e) => dispatch({ type: "SET_FIELD", field: "price", value: parseNaira(e.target.value) })} className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-green-500" required />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">Discount price (₦)</label>
//               <input type="text" value={form.discountPrice ? formatNaira(form.discountPrice) : ""} onChange={(e) => dispatch({ type: "SET_FIELD", field: "discountPrice", value: parseNaira(e.target.value) })} className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-green-500" />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">Status</label>
//               <select value={form.status} onChange={(e) => dispatch({ type: "SET_FIELD", field: "status", value: e.target.value })} className="border rounded px-3 py-2 w-full">
//                 <option value="ACTIVE">Active</option>
//                 <option value="DRAFT">Draft</option>
//                 <option value="ARCHIVED">Archived</option>
//               </select>
//             </div>
//           </div>
//           <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-200">
//             <div className="flex items-center gap-3">
//               <StarIcon className="h-6 w-6 text-orange-600" />
//               <div><h3 className="font-bold text-orange-900">Featured Product</h3><p className="text-xs text-orange-700">Show in homepage Flash Sales.</p></div>
//             </div>
//             <input type="checkbox" checked={form.isFeatured} onChange={(e) => dispatch({ type: "SET_FIELD", field: "isFeatured", value: e.target.checked })} className="h-6 w-6" />
//           </div>
//         </div>

//         {/* Categories Section - FIXED SEARCH & SELECTION */}
//         <div className="p-6 border rounded-lg shadow-sm bg-gray-50">
//           <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-orange-700"><Squares2X2Icon className="h-6 w-6" /> Categories</h2>
//          <Select
//             instanceId={selectInstanceId}
//             isMulti
//             isSearchable
//             options={groupedOptions}
//             value={selectedValue}
//             onChange={(selected) => dispatch({
//               type: "SET_FIELD",
//               field: "categories",
//               value: (selected ?? []).map((s: any) => s.value),
//             })}
//             placeholder="Search categories..."
//             className="w-full"
//           />
//                 </div>

//         {/* Shipping Section */}
//         <div className="p-6 border rounded-lg shadow-sm bg-gray-50">
//           <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-indigo-700"><TruckIcon className="h-6 w-6" /> Shipping</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <label className="block text-sm font-medium mb-1">Shipping Method</label>
//               <select value={form.shippingMethod} onChange={(e) => dispatch({ type: "SET_FIELD", field: "shippingMethod", value: e.target.value })} className="border rounded px-3 py-2 w-full">
//                 <option value="Standard">Standard Shipping</option>
//                 <option value="Express">Express Delivery</option>
//                 <option value="Pickup">Store Pickup</option>
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">Weight (kg)</label>
//               <input type="number" step="0.1" value={form.weight} onChange={(e) => dispatch({ type: "SET_FIELD", field: "weight", value: Number(e.target.value) })} className="border rounded px-3 py-2 w-full" />
//             </div>
//           </div>
//         </div>

//         {/* Images Section */}
//         <div className="p-6 border rounded-lg shadow-sm bg-gray-50">
//           <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-pink-700"><PhotoIcon className="h-6 w-6" /> Product images</h2>
//           <input type="file" accept="image/*" onChange={handleMainImageChange} className="mb-4" />
//           {previewMain && <img src={previewMain} alt="Main" className="h-40 w-40 object-cover rounded-lg border mb-6" />}
          
//           <label className="block text-sm font-medium mb-1">Additional images</label>
//           <input type="file" accept="image/*" multiple onChange={handleExtraImagesChange} className="mb-4" />
//           <div className="grid grid-cols-4 gap-4">
//             {previewExtras.map((url, idx) => (
//               <div key={idx} className="relative">
//                 <img src={url} alt="Extra" className="h-24 w-24 object-cover rounded-lg border" />
//                 <button type="button" onClick={() => removeExtraImage(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 text-xs">✕</button>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Tags Section */}
//         <div className="p-6 border rounded-lg shadow-sm bg-gray-50">
//           <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-teal-700"><TagIcon className="h-6 w-6" /> Tags</h2>
//           <input type="text" placeholder="Add tags, separated by commas..." value={tagInput} onChange={handleTagChange} className="border rounded px-3 py-2 w-full" />
//         </div>

//         {/* Action Buttons */}
//         <div className="flex gap-4">
//           <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 text-white py-4 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50">
//             {isSubmitting ? "Saving..." : "Save Product"}
//           </button>
//           <button type="button" onClick={() => dispatch({ type: "RESET" })} className="px-8 py-4 bg-gray-200 rounded-lg font-bold">Reset</button>
//         </div>
//       </form>
//     </div>
//   );
// }




"use client";

import React, { useEffect, useId, useReducer, useState } from "react";
import Select from "react-select";
import {
  TagIcon,
  CurrencyDollarIcon,
  Squares2X2Icon,
  PhotoIcon,
  ArchiveBoxIcon,
  ArrowPathIcon,
  StarIcon,
  CheckBadgeIcon,
  TruckIcon
} from "@heroicons/react/24/outline";
import { mapCategoriesToOptions } from "@/app/lib/MapCategoriesToOptions";
import { normalizeProductData } from "@/app/lib/normalizeProductData";
import RichTextEditor from "./RichTextEditor";

interface Category {
  id: string;
  name: string;
  parentId?: string | null;
}

interface ProductFormProps {
  onSubmit: (payload: FormData) => Promise<void>;
  initialData?: any; 
  categories: Category[]; 
  vendorId?: string;
}

function formatNaira(value: number) {
  if (!value) return "";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(value);
}

function parseNaira(input: string) {
  const digits = input.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

export type ProductFormState = {
  title: string;
  description: string;
  price: number;
  discountPrice: number;
  status: string;
  isFeatured: boolean;
  categories: string[];
  sku: string;
  stock: number;
  brand: string;
  tags: string[];
  shippingMethod: string; // New
  weight: number; // New
  mainImage: File | string | null;
  extraImages: (File | string)[];
  metaTitle: string;
  metaDescription: string;
};

type FormAction =
  | { type: "SET_FIELD"; field: keyof ProductFormState; value: any }
  | { type: "RESET" };

const initialFormState: ProductFormState = {
  title: "",
  description: "",
  price: 0,
  discountPrice: 0,
  status: "ACTIVE",
  isFeatured: false,
  categories: [],
  sku: "",
  stock: 0,
  brand: "",
  tags: [],
  shippingMethod: "Standard",
  weight: 0,
  mainImage: null,
  extraImages: [],
  metaTitle: "",
  metaDescription: "",
};

function formReducer(state: ProductFormState, action: FormAction): ProductFormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "RESET":
      return initialFormState;
    default:
      return state;
  }
}

export default function ProductForm({ 
  onSubmit, 
  initialData, 
  categories = [], 
  vendorId 
}: ProductFormProps) {
  const [form, dispatch] = useReducer(formReducer, initialData ? normalizeProductData(initialData) : initialFormState);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewMain, setPreviewMain] = useState<string | null>(null);
  const [previewExtras, setPreviewExtras] = useState<string[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
  const selectInstanceId = useId();

  // Handle Tag Input separately to allow comma typing without losing focus
  const [tagInput, setTagInput] = useState(form.tags.join(", "));

  useEffect(() => {
    if (form.mainImage instanceof File) {
      const url = URL.createObjectURL(form.mainImage);
      setPreviewMain(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewMain(typeof form.mainImage === "string" ? form.mainImage : null);
    }
  }, [form.mainImage]);

  useEffect(() => {
    const urls = form.extraImages.map(img => {
      if (img instanceof File) return URL.createObjectURL(img);
      if (typeof img === "string") return img;
      return "";
    }).filter(url => url !== "");
    setPreviewExtras(urls);
  }, [form.extraImages]);

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) dispatch({ type: "SET_FIELD", field: "mainImage", value: file });
  };

  const handleExtraImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    dispatch({ type: "SET_FIELD", field: "extraImages", value: [...form.extraImages, ...files] });
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTagInput(val);
    const tags = val.split(",").map(t => t.trim()).filter(t => t !== "");
    dispatch({ type: "SET_FIELD", field: "tags", value: tags });
  };

  const removeExtraImage = (index: number) => {
    const imgToRemove = form.extraImages[index];
    if (typeof imgToRemove === "string" && initialData?.images) {
      const imgObj = initialData.images.find((i: any) => i.url === imgToRemove);
      if (imgObj) setDeletedImageIds(prev => [...prev, imgObj.id]);
    }
    const newExtras = [...form.extraImages];
    newExtras.splice(index, 1);
    dispatch({ type: "SET_FIELD", field: "extraImages", value: newExtras });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!form.title.trim()) { setError("Title is required."); setIsSubmitting(false); return; }
    if (form.categories.length < 1) { setError("Select a category."); setIsSubmitting(false); return; }

    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("price", String(form.price));
    fd.append("discountPrice", String(form.discountPrice));
    fd.append("status", form.status);
    fd.append("isFeatured", String(form.isFeatured));
    fd.append("isPublished", String(form.status === "ACTIVE"));
    fd.append("categoryId", form.categories[form.categories.length - 1]);
    fd.append("stock", String(form.stock));
    fd.append("brand", form.brand);
    fd.append("tags", JSON.stringify(form.tags));
    fd.append("sku", form.sku);
    fd.append("shippingMethod", form.shippingMethod);
    fd.append("weight", String(form.weight));
    fd.append("deletedImageIds", JSON.stringify(deletedImageIds));

    if (vendorId) fd.append("vendorId", vendorId);
    if (form.mainImage instanceof File) fd.append("mainImage", form.mainImage);
    form.extraImages.forEach(img => { if (img instanceof File) fd.append("extraImages", img); });

    try {
      await onSubmit(fd);
    } catch (err) {
      setError("Error saving product.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Categories Logic Fix
  const groupedOptions = mapCategoriesToOptions(categories);
  const flatOptions = groupedOptions.flatMap((g: any) => g.options || []);
  const selectedValue = flatOptions.filter((opt: any) => form.categories.includes(opt.value));

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-center text-3xl md:text-5xl font-bold mb-8 text-gray-800 uppercase tracking-tighter italic">
       {initialData ? "⚡ Update Product" : "📦 Add New Product"}
      </h1>

      {vendorId && (
        <div className="mb-8 p-4 bg-accent-navy text-neutral-white rounded-3xl flex items-center justify-between border border-white/10 shadow-xl relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10">
            <div className="bg-brand-primary p-2 rounded-xl">
              <CheckBadgeIcon className="h-6 w-6 text-accent-navy" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Authenticated Store Listing</p>
              <h4 className="text-sm font-bold">Your inventory will be listed under your business profile.</h4>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-10 pb-20">
        {error && <div className="text-red-700 bg-red-50 border border-red-200 p-3 rounded sticky top-4 z-50 shadow-md">{error}</div>}

        {/* Basic Info */}
        <div className="p-6 border rounded-lg shadow-sm bg-gray-50">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-blue-700">
            <TagIcon className="h-6 w-6" /> Basic info
          </h2>
          <label className="block text-sm font-medium mb-1">Product title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => dispatch({ type: "SET_FIELD", field: "title", value: e.target.value })}
            className="border rounded px-3 py-2 w-full mb-4 focus:ring-2 focus:ring-blue-500"
            required
          />
          <label className="block text-sm font-medium mb-1">Description</label>
          <RichTextEditor
            content={form.description}
            onChange={(html) => dispatch({ type: "SET_FIELD", field: "description", value: html })}
          />
        </div>

        {/* Pricing & Visibility */}
        <div className="p-6 border rounded-lg shadow-sm bg-gray-50">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-green-700">
            <CurrencyDollarIcon className="h-6 w-6" /> Pricing & Visibility
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium mb-1">Price (₦)</label>
              <input
                type="text"
                value={form.price ? formatNaira(form.price) : ""}
                onChange={(e) => dispatch({ type: "SET_FIELD", field: "price", value: parseNaira(e.target.value) })}
                className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Discount price (₦)</label>
              <input
                type="text"
                value={form.discountPrice ? formatNaira(form.discountPrice) : ""}
                onChange={(e) => dispatch({ type: "SET_FIELD", field: "discountPrice", value: parseNaira(e.target.value) })}
                className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => dispatch({ type: "SET_FIELD", field: "status", value: e.target.value })}
                className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-green-500"
              >
                <option value="ACTIVE">Active</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-200">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-lg"><StarIcon className="h-6 w-6 text-orange-600" /></div>
              <div>
                <h3 className="font-bold text-orange-900">Flash Sale / Featured</h3>
                <p className="text-xs text-orange-700">Display this product in the homepage Flash Sales section.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => dispatch({ type: "SET_FIELD", field: "isFeatured", value: e.target.checked })} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
          </div>
        </div>

        {/* Shipping Section */}
        <div className="p-6 border rounded-lg shadow-sm bg-gray-50">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-indigo-700">
            <TruckIcon className="h-6 w-6" /> Shipping
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Shipping Method</label>
              <select
                value={form.shippingMethod}
                onChange={(e) => dispatch({ type: "SET_FIELD", field: "shippingMethod", value: e.target.value })}
                className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Standard">Standard Shipping</option>
                <option value="Express">Express Delivery</option>
                <option value="Free">Free Shipping</option>
                <option value="Pickup">Store Pickup</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={form.weight}
                onChange={(e) => dispatch({ type: "SET_FIELD", field: "weight", value: Number(e.target.value) })}
                className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="p-6 border rounded-lg shadow-sm bg-gray-50">
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2 text-orange-700">
            <Squares2X2Icon className="h-6 w-6" /> Categories
          </h2>
          <Select
            instanceId={selectInstanceId}
            isMulti
            isSearchable
            options={groupedOptions}
            value={selectedValue}
            onChange={(selected) => dispatch({
              type: "SET_FIELD",
              field: "categories",
              value: (selected ?? []).map((s: any) => s.value),
            })}
            placeholder="Search categories..."
            className="w-full"
          />
        </div>

        {/* Images Section */}
        <div className="p-6 border rounded-lg shadow-sm bg-gray-50">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-pink-700">
            <PhotoIcon className="h-6 w-6" /> Product images
          </h2>
          <label className="block text-sm font-medium mb-1">Main image</label>
          <label htmlFor="mainImageUpload" className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 bg-white text-center hover:border-blue-500 transition">
            <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M4 12l4-4m0 0l4 4m-4-4v12" /></svg>
            <p className="text-sm text-gray-600 font-medium">Click to change main image</p>
          </label>
          <input id="mainImageUpload" type="file" accept="image/*" onChange={handleMainImageChange} className="hidden" />

          {previewMain && (
            <div className="relative mt-4 w-full max-w-sm">
              <img src={previewMain} alt="Main" className="h-56 w-full object-cover rounded-lg border shadow-md" />
              <button type="button" onClick={() => dispatch({ type: "SET_FIELD", field: "mainImage", value: null })} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1.5 shadow-lg">✕</button>
            </div>
          )}

          <label className="block text-sm font-medium mt-8 mb-1">Extra images</label>
          <label htmlFor="extraImagesUpload" className="cursor-pointer flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 bg-white text-center hover:border-pink-500 transition">
            <p className="text-sm text-gray-600 font-medium">Add more photos</p>
          </label>
          <input id="extraImagesUpload" type="file" accept="image/*" multiple onChange={handleExtraImagesChange} className="hidden" />

          {previewExtras.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {form.extraImages.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img src={previewExtras[idx]} alt="Extra" className="h-28 w-full object-cover rounded-lg border shadow-sm" />
                  <button type="button" onClick={() => removeExtraImage(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inventory & Branding */}
        <div className="p-6 border rounded-lg shadow-sm bg-gray-50">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-purple-700">
            <ArchiveBoxIcon className="h-6 w-6" /> Inventory & branding
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div><label className="block text-sm font-medium mb-1">SKU</label><input type="text" value={form.sku} onChange={(e) => dispatch({ type: "SET_FIELD", field: "sku", value: e.target.value })} className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-purple-500" /></div>
            <div><label className="block text-sm font-medium mb-1">Stock</label><input type="number" value={form.stock} onChange={(e) => dispatch({ type: "SET_FIELD", field: "stock", value: Number(e.target.value) })} className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-purple-500" /></div>
            <div><label className="block text-sm font-medium mb-1">Brand</label><input type="text" value={form.brand} onChange={(e) => dispatch({ type: "SET_FIELD", field: "brand", value: e.target.value })} className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-purple-500" /></div>
          </div>
        </div>

        {/* Tags Section */}
        <div className="p-6 border rounded-lg shadow-sm bg-gray-50">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-teal-700">
            <TagIcon className="h-6 w-6" /> Tags
          </h2>
          <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
          <input
            type="text"
            placeholder="e.g. sneakers, running, sports"
            value={tagInput}
            onChange={handleTagChange}
            className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* SEO Section */}
        <div className="p-6 border rounded-lg shadow-sm bg-gray-50">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-indigo-700">SEO Settings</h2>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium mb-1">Meta Title</label><input type="text" value={form.metaTitle} onChange={(e) => dispatch({ type: "SET_FIELD", field: "metaTitle", value: e.target.value })} className="border rounded px-3 py-2 w-full" /></div>
            <div><label className="block text-sm font-medium mb-1">Meta Description</label><textarea value={form.metaDescription} onChange={(e) => dispatch({ type: "SET_FIELD", field: "metaDescription", value: e.target.value })} className="border rounded px-3 py-2 w-full" rows={3} /></div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button type="submit" disabled={isSubmitting} className={`flex-1 ${initialData ? "bg-indigo-600" : "bg-blue-600"} text-white py-4 px-6 rounded-lg flex items-center justify-center gap-2 text-lg font-semibold transition shadow-md disabled:opacity-50`}>
            {isSubmitting ? <ArrowPathIcon className="h-6 w-6 animate-spin" /> : (initialData ? <ArrowPathIcon className="h-6 w-6" /> : <TagIcon className="h-6 w-6" />)}
            {initialData ? "Update product" : "Save product"}
          </button>
          <button type="button" onClick={() => dispatch({ type: "RESET" })} className="flex-1 bg-gray-200 text-gray-800 py-4 px-6 rounded-lg font-semibold">Reset Form</button>
        </div>
      </form>
    </div>
  );
}