// "use client";

// import React, { useEffect, useId, useReducer, useState } from "react";
// import Select from "react-select";
// import {
//   TagIcon,
//   CurrencyDollarIcon,
//   Squares2X2Icon,
//   PhotoIcon,
//   ArchiveBoxIcon,
//   ArrowPathIcon,
//   StarIcon 
// } from "@heroicons/react/24/outline";
// import { mapCategoriesToOptions } from "@/app/lib/MapCategoriesToOptions";
// import { normalizeProductData } from "@/app/lib/normalizeProductData";
// import RichTextEditor from "./RichTextEditor";

// interface Category {
//   id: string;
//   name: string;
//   parentId?: string | null;
// }

// interface ProductFormProps {
//   onSubmit: (payload: FormData) => Promise<void>;
//   initialData?: any; 
//   categories: Category[]; // Using the categories passed from the parent
// }

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
//   categories: string[];
//   sku: string;
//   stock: number;
//   brand: string;
//   tags: string[];
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

// export default function ProductForm({ onSubmit, initialData, categories = [] }: ProductFormProps) {
//   // Use the data from props. Shadowing state removed.
//   const [form, dispatch] = useReducer(formReducer, normalizeProductData(initialData) || initialFormState);
  
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const [previewMain, setPreviewMain] = useState<string | null>(null);
//   const [previewExtras, setPreviewExtras] = useState<string[]>([]);

//   const [isDraggingMain, setIsDraggingMain] = useState(false);
//   const [isDraggingExtra, setIsDraggingExtra] = useState(false);

//   const selectInstanceId = useId();
//   const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);

//   useEffect(() => {
//     if (form.mainImage) {
//       const mainUrl = form.mainImage instanceof File 
//         ? URL.createObjectURL(form.mainImage) 
//         : form.mainImage; 
//       setPreviewMain(mainUrl);
//     }

//     if (form.extraImages.length > 0) {
//       const urls = form.extraImages.map(img => {
//         if (typeof img === "string") return img;
//         if (img instanceof File) return URL.createObjectURL(img);
//         if (img && typeof img === "object" && "url" in img) return (img as any).url;
//         return ""; 
//       }).filter(url => url !== ""); 
//       setPreviewExtras(urls);
//     }
//   }, [form.mainImage, form.extraImages]);

//   const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     dispatch({ type: "SET_MAIN_IMAGE", file });
//   };

//   const handleExtraImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = Array.from(e.target.files ?? []);
//     if (files.length === 0) return;
//     dispatch({ type: "SET_EXTRA_IMAGES", files });
//   };

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     setError(null);
//     setIsSubmitting(true);

//     if (!form.title.trim()) { setError("Product title is required."); setIsSubmitting(false); return; }
//     if (form.categories.length < 1) { setError("Please select at least one category."); setIsSubmitting(false); return; }

//     const fd = new FormData();
//     fd.append("title", form.title);
//     fd.append("description", form.description);
//     fd.append("price", String(form.price));
//     fd.append("discountPrice", String(form.discountPrice || 0));
//     fd.append("status", form.status);
//     fd.append("isFeatured", String(form.isFeatured));
//     fd.append("categoryId", form.categories[form.categories.length - 1]);
//     fd.append("stock", String(form.stock));
//     fd.append("brand", form.brand);
//     fd.append("tags", JSON.stringify(form.tags));
//     fd.append("sku", (form.sku ?? "").trim());
//     fd.append("metaTitle", (form.metaTitle ?? "").trim());
//     fd.append("metaDescription", (form.metaDescription ?? "").trim());
//     fd.append("deletedImageIds", JSON.stringify(deletedImageIds));

//     if (form.mainImage instanceof File) fd.append("mainImage", form.mainImage);
//     form.extraImages.forEach((img) => {
//       if (img instanceof File) fd.append("extraImages", img);
//     });

//     try {
//       await onSubmit(fd);
//     } catch (err) {
//       setError("Failed to save product. Please try again.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   }

//   const removeMainImage = () => {
//     dispatch({ type: "SET_FIELD", field: "mainImage", value: null });
//     setPreviewMain(null);
//   };

//   const removeExtraImage = (index: number, existingId?: string) => {
//     const newExtras = [...form.extraImages];
//     newExtras.splice(index, 1);
//     dispatch({ type: "SET_FIELD", field: "extraImages", value: newExtras });

//     const newPreviews = [...previewExtras];
//     newPreviews.splice(index, 1);
//     setPreviewExtras(newPreviews);

//     if (existingId) {
//       setDeletedImageIds((prev) => [...prev, existingId]);
//     }
//   };

//   // --- Logic for React Select ---
//   const groupedOptions = mapCategoriesToOptions(categories);
//   const flatOptions = groupedOptions.flatMap((g: any) => g.options || []);
//   const selectedValue = flatOptions.filter((opt: any) => form.categories.includes(opt.value));

//   return (
//     <div className="max-w-5xl mx-auto">
//       <h1 className="text-center text-3xl md:text-5xl font-bold mb-8 text-gray-800 uppercase tracking-tighter italic">
//         {initialData ? "⚡ Update Product" : "📦 Create Product"}
//       </h1>

//       <form onSubmit={handleSubmit} className="space-y-10 pb-20">
//         {error && (
//           <div className="text-red-700 bg-red-50 border border-red-200 p-3 rounded sticky top-4 z-50 shadow-md">
//             {error}
//           </div>
//         )}

//         {/* Basic Info */}
//         <div className="p-6 border rounded-lg shadow-sm bg-gray-50">
//           <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-blue-700">
//             <TagIcon className="h-6 w-6" /> Basic info
//           </h2>
//           <label className="block text-sm font-medium mb-1">Product title</label>
//           <input
//             type="text"
//             value={form.title}
//             onChange={(e) => dispatch({ type: "SET_FIELD", field: "title", value: e.target.value })}
//             className="border rounded px-3 py-2 w-full mb-4 focus:ring-2 focus:ring-blue-500"
//             required
//           />
//           <label className="block text-sm font-medium mb-1">Description</label>
//           <RichTextEditor
//             content={form.description}
//             onChange={(html) => dispatch({ type: "SET_FIELD", field: "description", value: html })}
//           />
//         </div>

//         {/* Pricing & Featured Toggle */}
//         <div className="p-6 border rounded-lg shadow-sm bg-gray-50">
//           <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-green-700">
//             <CurrencyDollarIcon className="h-6 w-6" /> Pricing & Visibility
//           </h2>
          
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//             <div>
//               <label className="block text-sm font-medium mb-1">Price (₦)</label>
//               <input
//                 type="text"
//                 value={form.price ? formatNaira(form.price) : ""}
//                 onChange={(e) => dispatch({ type: "SET_FIELD", field: "price", value: parseNaira(e.target.value) })}
//                 className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-green-500"
//                 required
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">Discount price (₦)</label>
//               <input
//                 type="text"
//                 value={form.discountPrice ? formatNaira(form.discountPrice) : ""}
//                 onChange={(e) => dispatch({ type: "SET_FIELD", field: "discountPrice", value: parseNaira(e.target.value) })}
//                 className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-green-500"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">Status</label>
//               <select
//                 value={form.status}
//                 onChange={(e) => dispatch({ type: "SET_FIELD", field: "status", value: e.target.value })}
//                 className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-green-500"
//               >
//                 <option value="ACTIVE">Active</option>
//                 <option value="DRAFT">Draft</option>
//                 <option value="ARCHIVED">Archived</option>
//               </select>
//             </div>
//           </div>

//           <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-200">
//             <div className="flex items-center gap-3">
//               <div className="bg-orange-100 p-2 rounded-lg">
//                 <StarIcon className="h-6 w-6 text-orange-600" />
//               </div>
//               <div>
//                 <h3 className="font-bold text-orange-900">Flash Sale / Featured</h3>
//                 <p className="text-xs text-orange-700">Display this product in the homepage Flash Sales section.</p>
//               </div>
//             </div>
//             <label className="relative inline-flex items-center cursor-pointer">
//               <input 
//                 type="checkbox" 
//                 checked={form.isFeatured || false} 
//                 onChange={(e) => dispatch({ 
//                   type: "SET_FIELD", 
//                   field: "isFeatured", 
//                   value: e.target.checked 
//                 })}
//                 className="sr-only peer"
//               />
//               <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
//             </label>
//           </div>
//         </div>

//         {/* Categories Section */}
//         <div className="p-6 border rounded-lg shadow-sm bg-gray-50">
//           <h2 className="text-xl font-semibold mb-2 flex items-center gap-2 text-orange-700">
//             <Squares2X2Icon className="h-6 w-6" /> Categories
//           </h2>
//           <Select
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
//         </div>

//         {/* Images Section */}
//         <div className="p-6 border rounded-lg shadow-sm bg-gray-50">
//           <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-pink-700">
//             <PhotoIcon className="h-6 w-6" />
//             Product images
//           </h2>

//           <label className="block text-sm font-medium mb-1">Main image</label>
//           <label
//             htmlFor="mainImageUpload"
//             className={`cursor-pointer flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 bg-white text-center transition ${
//               isDraggingMain ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-500"
//             }`}
//           >
//             <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M4 12l4-4m0 0l4 4m-4-4v12" />
//             </svg>
//             <p className="text-sm text-gray-600 font-medium">Click to change main image</p>
//           </label>
//           <input id="mainImageUpload" type="file" accept="image/*" onChange={handleMainImageChange} className="hidden" />

//           {previewMain && (
//             <div className="relative mt-4 w-full max-w-sm group">
//               <img src={previewMain} alt="Main preview" className="h-56 w-full object-cover rounded-lg border shadow-md" />
//               <button
//                 type="button"
//                 onClick={removeMainImage}
//                 className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1.5 shadow-lg hover:bg-red-700 transition transform hover:scale-110"
//                 title="Remove image"
//               >
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               </button>
//             </div>
//           )}

//           <label className="block text-sm font-medium mt-8 mb-1">Extra images</label>
//           <label
//             htmlFor="extraImagesUpload"
//             className={`cursor-pointer flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 bg-white text-center transition ${
//               isDraggingExtra ? "border-pink-500 bg-pink-50" : "border-gray-300 hover:border-pink-500"
//             }`}
//           >
//             <p className="text-sm text-gray-600 font-medium">Add more photos</p>
//             <p className="text-xs text-gray-400">Drag & drop or click to select</p>
//           </label>
//           <input id="extraImagesUpload" type="file" accept="image/*" multiple onChange={handleExtraImagesChange} className="hidden" />

//           {previewExtras.length > 0 && (
//             <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
//               {form.extraImages.map((img, idx) => {
//                 const imageId = (img as any).id;
//                 const previewUrl = previewExtras[idx];
//                 return (
//                   <div key={idx} className="relative group">
//                     <img 
//                       src={previewUrl} 
//                       alt={`Extra ${idx}`} 
//                       className="h-28 w-full object-cover rounded-lg border shadow-sm group-hover:brightness-90 transition" 
//                     />
//                     <button
//                       type="button"
//                       onClick={() => removeExtraImage(idx, imageId)}
//                       className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition"
//                     >
//                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
//                       </svg>
//                     </button>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>

//         {/* Inventory & Branding */}
//         <div className="p-6 border rounded-lg shadow-sm bg-gray-50">
//           <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-purple-700">
//             <ArchiveBoxIcon className="h-6 w-6" />
//             Inventory & branding
//           </h2>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div>
//               <label className="block text-sm font-medium mb-1">SKU</label>
//               <input
//                 type="text"
//                 placeholder="e.g. NIKE-AMAX-001"
//                 value={form.sku}
//                 onChange={(e) => dispatch({ type: "SET_FIELD", field: "sku", value: e.target.value })}
//                 className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-purple-500"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">Stock</label>
//               <input
//                 type="number"
//                 placeholder="e.g. 50"
//                 value={form.stock}
//                 onChange={(e) => dispatch({ type: "SET_FIELD", field: "stock", value: Number(e.target.value) })}
//                 className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-purple-500"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">Brand</label>
//               <input
//                 type="text"
//                 placeholder="e.g. Nike"
//                 value={form.brand}
//                 onChange={(e) => dispatch({ type: "SET_FIELD", field: "brand", value: e.target.value })}
//                 className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-purple-500"
//               />
//             </div>
//           </div>
//         </div>

//         {/* Tags */}
//         <div className="p-6 border rounded-lg shadow-sm bg-gray-50">
//           <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-teal-700">
//             <TagIcon className="h-6 w-6" />
//             Tags
//           </h2>
//           <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
//           <input
//             type="text"
//             placeholder="e.g. sneakers, running, sports"
//             value={form.tags.join(", ")}
//             onChange={(e) =>
//               dispatch({
//                 type: "SET_FIELD",
//                 field: "tags",
//                 value: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
//               })
//             }
//             className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-teal-500"
//           />
//         </div>

//         {/* SEO Section */}
//         <div className="p-6 border rounded-lg shadow-sm bg-gray-50">
//           <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-indigo-700">
//             SEO Settings
//           </h2>
//           <div>
//             <label className="block text-sm font-medium mb-1">Meta Title</label>
//             <input
//               type="text"
//               placeholder="Optional SEO title"
//               value={form.metaTitle ?? ""}
//               onChange={(e) => dispatch({ type: "SET_FIELD", field: "metaTitle", value: e.target.value })}
//               className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-indigo-500"
//             />
//           </div>
//           <div className="mt-4">
//             <label className="block text-sm font-medium mb-1">Meta Description</label>
//             <textarea
//               placeholder="Optional SEO description"
//               value={form.metaDescription ?? ""}
//               onChange={(e) => dispatch({ type: "SET_FIELD", field: "metaDescription", value: e.target.value })}
//               className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-indigo-500"
//               rows={3}
//             />
//           </div>
//         </div>

//         {/* Submit Buttons */}
//         <div className="flex flex-col sm:flex-row gap-4">
//           <button
//             type="submit"
//             disabled={isSubmitting}
//             className={`flex-1 ${initialData ? "bg-indigo-600" : "bg-blue-600"} text-white py-4 px-6 rounded-lg flex items-center justify-center gap-2 text-lg font-semibold transition shadow-md disabled:opacity-50 hover:brightness-110`}
//           >
//             {isSubmitting ? (
//               <ArrowPathIcon className="h-6 w-6 animate-spin" />
//             ) : (
//               initialData ? <ArrowPathIcon className="h-6 w-6" /> : <TagIcon className="h-6 w-6" />
//             )}
//             {initialData ? "Update product" : "Save product"}
//           </button>

//           <button
//             type="button"
//             onClick={() => {
//               dispatch({ type: "RESET" });
//               setPreviewMain(null);
//               setPreviewExtras([]);
//             }}
//             className="flex-1 bg-gray-200 text-gray-800 py-4 px-6 rounded-lg font-semibold hover:bg-gray-300 transition shadow-md"
//           >
//             Reset Form
//           </button>
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
  StarIcon 
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
  mainImage: File | string | null;
  extraImages: (File | string)[];
  metaTitle: string;
  metaDescription: string;
};

type FormAction =
  | { type: "SET_FIELD"; field: keyof ProductFormState; value: any }
  | { type: "SET_MAIN_IMAGE"; file: File }
  | { type: "SET_EXTRA_IMAGES"; files: File[] }
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
  mainImage: null,
  extraImages: [],
  metaTitle: "",
  metaDescription: "",
};

function formReducer(state: ProductFormState, action: FormAction): ProductFormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_MAIN_IMAGE":
      return { ...state, mainImage: action.file };
    case "SET_EXTRA_IMAGES":
      return { ...state, extraImages: action.files };
    case "RESET":
      return initialFormState;
    default:
      return state;
  }
}

export default function ProductForm({ onSubmit, initialData, categories = [] }: ProductFormProps) {
  const [form, dispatch] = useReducer(formReducer, initialData ? normalizeProductData(initialData) : initialFormState);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [previewMain, setPreviewMain] = useState<string | null>(null);
  const [previewExtras, setPreviewExtras] = useState<string[]>([]);

  const [isDraggingMain, setIsDraggingMain] = useState(false);
  const [isDraggingExtra, setIsDraggingExtra] = useState(false);

  const selectInstanceId = useId();
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);

  // FIXED: Improved effect to handle initial string URLs from DB
  useEffect(() => {
    if (form.mainImage) {
      if (form.mainImage instanceof File) {
        const objectUrl = URL.createObjectURL(form.mainImage);
        setPreviewMain(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
      } else if (typeof form.mainImage === "string") {
        setPreviewMain(form.mainImage);
      }
    } else {
      setPreviewMain(null);
    }
  }, [form.mainImage]);

  useEffect(() => {
    if (form.extraImages.length > 0) {
      const urls = form.extraImages.map(img => {
        if (typeof img === "string") return img;
        if (img instanceof File) return URL.createObjectURL(img);
        if (img && typeof img === "object" && "url" in img) return (img as any).url;
        return ""; 
      }).filter(url => url !== ""); 
      setPreviewExtras(urls);
    } else {
      setPreviewExtras([]);
    }
  }, [form.extraImages]);

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    dispatch({ type: "SET_MAIN_IMAGE", file });
  };

  const handleExtraImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    dispatch({ type: "SET_EXTRA_IMAGES", files });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!form.title.trim()) { setError("Product title is required."); setIsSubmitting(false); return; }
    if (form.categories.length < 1) { setError("Please select at least one category."); setIsSubmitting(false); return; }

    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("price", String(form.price));
    fd.append("discountPrice", String(form.discountPrice || 0));
    fd.append("status", form.status);
    fd.append("isFeatured", String(form.isFeatured));
    fd.append("categoryId", form.categories[form.categories.length - 1]);
    fd.append("stock", String(form.stock));
    fd.append("brand", form.brand);
    fd.append("tags", JSON.stringify(form.tags));
    fd.append("sku", (form.sku ?? "").trim());
    fd.append("metaTitle", (form.metaTitle ?? "").trim());
    fd.append("metaDescription", (form.metaDescription ?? "").trim());
    fd.append("deletedImageIds", JSON.stringify(deletedImageIds));

    if (form.mainImage instanceof File) fd.append("mainImage", form.mainImage);
    form.extraImages.forEach((img) => {
      if (img instanceof File) fd.append("extraImages", img);
    });

    try {
      await onSubmit(fd);
    } catch (err) {
      setError("Failed to save product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const removeMainImage = () => {
    dispatch({ type: "SET_FIELD", field: "mainImage", value: null });
  };

  const removeExtraImage = (index: number, existingId?: string) => {
    const newExtras = [...form.extraImages];
    newExtras.splice(index, 1);
    dispatch({ type: "SET_FIELD", field: "extraImages", value: newExtras });

    if (existingId) {
      setDeletedImageIds((prev) => [...prev, existingId]);
    }
  };

  const groupedOptions = mapCategoriesToOptions(categories);
  const flatOptions = groupedOptions.flatMap((g: any) => g.options || []);
  const selectedValue = flatOptions.filter((opt: any) => form.categories.includes(opt.value));

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-center text-3xl md:text-5xl font-bold mb-8 text-gray-800 uppercase tracking-tighter italic">
        {initialData ? "⚡ Update Product" : "📦 Create Product"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-10 pb-20">
        {error && (
          <div className="text-red-700 bg-red-50 border border-red-200 p-3 rounded sticky top-4 z-50 shadow-md">
            {error}
          </div>
        )}

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
              <div className="bg-orange-100 p-2 rounded-lg">
                <StarIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-bold text-orange-900">Flash Sale / Featured</h3>
                <p className="text-xs text-orange-700">Display this product in the homepage Flash Sales section.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={form.isFeatured || false} 
                onChange={(e) => dispatch({ 
                  type: "SET_FIELD", 
                  field: "isFeatured", 
                  value: e.target.checked 
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
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
          <label
            htmlFor="mainImageUpload"
            className={`cursor-pointer flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 bg-white text-center transition ${
              isDraggingMain ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-500"
            }`}
          >
            <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M4 12l4-4m0 0l4 4m-4-4v12" />
            </svg>
            <p className="text-sm text-gray-600 font-medium">Click to change main image</p>
          </label>
          <input id="mainImageUpload" type="file" accept="image/*" onChange={handleMainImageChange} className="hidden" />

          {previewMain && (
            <div className="relative mt-4 w-full max-w-sm group">
              <img src={previewMain} alt="Main preview" className="h-56 w-full object-cover rounded-lg border shadow-md" />
              <button
                type="button"
                onClick={removeMainImage}
                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1.5 shadow-lg hover:bg-red-700 transition transform hover:scale-110"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          <label className="block text-sm font-medium mt-8 mb-1">Extra images</label>
          <label
            htmlFor="extraImagesUpload"
            className={`cursor-pointer flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 bg-white text-center transition ${
              isDraggingExtra ? "border-pink-500 bg-pink-50" : "border-gray-300 hover:border-pink-500"
            }`}
          >
            <p className="text-sm text-gray-600 font-medium">Add more photos</p>
            <p className="text-xs text-gray-400">Drag & drop or click to select</p>
          </label>
          <input id="extraImagesUpload" type="file" accept="image/*" multiple onChange={handleExtraImagesChange} className="hidden" />

          {previewExtras.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {form.extraImages.map((img, idx) => {
                const imageId = (img as any).id;
                const previewUrl = previewExtras[idx];
                return (
                  <div key={idx} className="relative group">
                    <img src={previewUrl} alt={`Extra ${idx}`} className="h-28 w-full object-cover rounded-lg border shadow-sm group-hover:brightness-90 transition" />
                    <button
                      type="button"
                      onClick={() => removeExtraImage(idx, imageId)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Inventory & Branding */}
        <div className="p-6 border rounded-lg shadow-sm bg-gray-50">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-purple-700">
            <ArchiveBoxIcon className="h-6 w-6" /> Inventory & branding
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">SKU</label>
              <input type="text" placeholder="e.g. NIKE-AMAX-001" value={form.sku} onChange={(e) => dispatch({ type: "SET_FIELD", field: "sku", value: e.target.value })} className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stock</label>
              <input type="number" placeholder="e.g. 50" value={form.stock} onChange={(e) => dispatch({ type: "SET_FIELD", field: "stock", value: Number(e.target.value) })} className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Brand</label>
              <input type="text" placeholder="e.g. Nike" value={form.brand} onChange={(e) => dispatch({ type: "SET_FIELD", field: "brand", value: e.target.value })} className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-purple-500" />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="p-6 border rounded-lg shadow-sm bg-gray-50">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-teal-700">
            <TagIcon className="h-6 w-6" /> Tags
          </h2>
          <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
          <input
            type="text"
            placeholder="e.g. sneakers, running, sports"
            value={form.tags.join(", ")}
            onChange={(e) => dispatch({ type: "SET_FIELD", field: "tags", value: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })}
            className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* SEO Section */}
        <div className="p-6 border rounded-lg shadow-sm bg-gray-50">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-indigo-700">SEO Settings</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Meta Title</label>
            <input type="text" placeholder="Optional SEO title" value={form.metaTitle ?? ""} onChange={(e) => dispatch({ type: "SET_FIELD", field: "metaTitle", value: e.target.value })} className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Meta Description</label>
            <textarea placeholder="Optional SEO description" value={form.metaDescription ?? ""} onChange={(e) => dispatch({ type: "SET_FIELD", field: "metaDescription", value: e.target.value })} className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-indigo-500" rows={3} />
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`flex-1 ${initialData ? "bg-indigo-600" : "bg-blue-600"} text-white py-4 px-6 rounded-lg flex items-center justify-center gap-2 text-lg font-semibold transition shadow-md disabled:opacity-50 hover:brightness-110`}
          >
            {isSubmitting ? <ArrowPathIcon className="h-6 w-6 animate-spin" /> : (initialData ? <ArrowPathIcon className="h-6 w-6" /> : <TagIcon className="h-6 w-6" />)}
            {initialData ? "Update product" : "Save product"}
          </button>

          <button
            type="button"
            onClick={() => dispatch({ type: "RESET" })}
            className="flex-1 bg-gray-200 text-gray-800 py-4 px-6 rounded-lg font-semibold hover:bg-gray-300 transition shadow-md"
          >
            Reset Form
          </button>
        </div>
      </form>
    </div>
  );
}