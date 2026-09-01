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
  CheckBadgeIcon,
  TruckIcon,
  PlusIcon,   
  TrashIcon 
} from "@heroicons/react/24/outline";
import { mapCategoriesToOptions } from "@/app/lib/MapCategoriesToOptions";
import { normalizeProductData } from "@/app/lib/normalizeProductData";
import RichTextEditor from "./RichTextEditor";
import DOMPurify from "isomorphic-dompurify"; // Required for XSS prevention

// --- SECURITY UTILITIES ---

/**
 * Strips HTML tags and suspicious characters from strings to prevent XSS
 * and basic injection attempts.
 */
const sanitizeInput = (val: string) => {
  if (typeof val !== "string") return val;
  // Remove scripts, styles, and event handlers
  return DOMPurify.sanitize(val, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }).trim();
};

/**
 * Rich Text Sanitizer (Allows only safe formatting)
 */
const sanitizeHTML = (html: string) => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3'],
  });
};

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
  const num = digits ? Number(digits) : 0;
  // Security: Prevent negative numbers or excessively large values (Integer Overflow protection)
  return Math.min(Math.max(0, num), 999999999);
}

interface VariantState {
  id?: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  attributes: Record<string, string>;
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
  shippingMethod: string;
  weight: number;
  mainImage: File | string | null;
  extraImages: (File | string)[];
  metaTitle: string;
  metaDescription: string;
  variants: VariantState[];
};

type FormAction =
  | { type: "SET_FIELD"; field: keyof ProductFormState; value: any }
  | { type: "SET_VARIANTS"; value: VariantState[] }
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
  variants: [], 
};

function formReducer(state: ProductFormState, action: FormAction): ProductFormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_VARIANTS": 
      return { ...state, variants: action.value };
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
  const [honeyPot, setHoneyPot] = useState(""); // Anti-bot Security
  const selectInstanceId = useId();

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

  const addVariant = () => {
    const newVariant: VariantState = {
      name: "",
      sku: `${sanitizeInput(form.sku)}-${form.variants.length + 1}`,
      price: form.price,
      stock: 0,
      attributes: {}
    };
    dispatch({ type: "SET_VARIANTS", value: [...form.variants, newVariant] });
  };

  const updateVariant = (index: number, field: keyof VariantState, value: any) => {
    const updated = [...form.variants];
    const sanitizedVal = field === "name" || field === "sku" ? sanitizeInput(value) : value;
    updated[index] = { ...updated[index], [field]: sanitizedVal };
    dispatch({ type: "SET_VARIANTS", value: updated });
  };

  const removeVariant = (index: number) => {
    dispatch({ type: "SET_VARIANTS", value: form.variants.filter((_, i) => i !== index) });
  };

  const handleMainImageChange = (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const file = e.target.files?.[0];

      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        setError("File too large (Max 5MB)");
        return;
      }

      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed");
        return;
      }

      /*
      * When editing an existing product, replacing the main image
      * means the previous main image must be deleted.
      */
      if (
        typeof form.mainImage === "string" &&
        initialData?.images
      ) {
        const oldImage = initialData.images.find(
          (image: any) =>
            image.url === form.mainImage
        );

        if (
          oldImage?.id &&
          !deletedImageIds.includes(oldImage.id)
        ) {
          setDeletedImageIds((prev) => [
            ...prev,
            oldImage.id,
          ]);
        }
      }

      dispatch({
        type: "SET_FIELD",
        field: "mainImage",
        value: file,
      });
    };


    const removeMainImage = () => {
  if (
    typeof form.mainImage === "string" &&
    initialData?.images
  ) {
    const image = initialData.images.find(
      (item: any) =>
        item.url === form.mainImage
    );

    if (
      image?.id &&
      !deletedImageIds.includes(image.id)
    ) {
      setDeletedImageIds((prev) => [
        ...prev,
        image.id,
      ]);
    }
  }

  dispatch({
    type: "SET_FIELD",
    field: "mainImage",
    value: null,
  });
};

  const handleExtraImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).filter(file => {
        return file.size <= 5 * 1024 * 1024 && file.type.startsWith("image/");
    });
    dispatch({ type: "SET_FIELD", field: "extraImages", value: [...form.extraImages, ...files] });
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTagInput(val);
    const tags = val.split(",").map(t => sanitizeInput(t)).filter(t => t !== "");
    dispatch({ type: "SET_FIELD", field: "tags", value: tags });
  };

  const removeExtraImage = (index: number) => {
    const imgToRemove = form.extraImages[index];
    if (typeof imgToRemove === "string" && initialData?.images) {
      const imgObj = initialData.images.find((i: any) => i.url === imgToRemove);
      if (imgObj) setDeletedImageIds(prev => [...prev, sanitizeInput(imgObj.id)]);
    }
    const newExtras = [...form.extraImages];
    newExtras.splice(index, 1);
    dispatch({ type: "SET_FIELD", field: "extraImages", value: newExtras });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (honeyPot) return; // Silent fail for bots
    
    setError(null);
    setIsSubmitting(true);

    // Validation & Final Sanitization
    const cleanTitle = sanitizeInput(form.title);
    if (!cleanTitle) { setError("Title is required."); setIsSubmitting(false); return; }
    if (form.categories.length < 1) { setError("Select a category."); setIsSubmitting(false); return; }

    const fd = new FormData();
    fd.append("title", cleanTitle);
    fd.append("description", sanitizeHTML(form.description));
    fd.append("price", String(form.price));
    fd.append("discountPrice", String(form.discountPrice));
    fd.append("status", sanitizeInput(form.status));
    fd.append("isFeatured", String(form.isFeatured));
    fd.append("isPublished", String(form.status === "ACTIVE"));
    
    const cleanedCategoryIds = form.categories
      .map((id) => sanitizeInput(id))
      .filter(Boolean);

    fd.append("categoryId", cleanedCategoryIds[0] || "");
    fd.append("categoryIds", JSON.stringify(cleanedCategoryIds));

    fd.append(
      "tags",
      JSON.stringify(form.tags.map((t) => sanitizeInput(t)).filter(Boolean))
    );
    
    
    fd.append("stock", String(form.stock));
    fd.append("brand", sanitizeInput(form.brand));
    fd.append("sku", sanitizeInput(form.sku));
    fd.append("shippingMethod", sanitizeInput(form.shippingMethod));
    fd.append("weight", String(form.weight));
    fd.append("deletedImageIds", JSON.stringify(deletedImageIds));
    fd.append("metaTitle", sanitizeInput(form.metaTitle));
    fd.append("metaDescription", sanitizeInput(form.metaDescription));
    
    // Serialize variants safely
    const cleanVariants = form.variants.map(v => ({
        ...v,
        name: sanitizeInput(v.name),
        sku: sanitizeInput(v.sku)
    }));
    fd.append("variants", JSON.stringify(cleanVariants));

    if (vendorId) fd.append("vendorId", sanitizeInput(vendorId));
    if (form.mainImage instanceof File) fd.append("mainImage", form.mainImage);
    form.extraImages.forEach(img => { if (img instanceof File) fd.append("extraImages", img); });

    try {
      await onSubmit(fd);
    } catch (err: any) {
      console.error("PRODUCT FORM SUBMIT ERROR:", err);
      setError(err?.message || "Failed to save product.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const groupedOptions = mapCategoriesToOptions(categories);
  const flatOptions = groupedOptions.flatMap((g: any) => g.options || []);
  const selectedValue = flatOptions.filter((opt: any) => form.categories.includes(opt.value));

  return (
    <div className="max-w-5xl mx-auto">
      {/* SECURITY: HoneyPot Field (Hidden from humans) */}
      <input 
        type="text" 
        style={{ display: 'none' }} 
        tabIndex={-1} 
        autoComplete="off" 
        onChange={(e) => setHoneyPot(e.target.value)} 
      />

      <h1 className="text-center text-md md:text-2xl font-bold mb-8 text-gray-800 uppercase tracking-tighter italic">
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
          <h2 className="text-sm xl:text-xl 2xl:text-2xl font-semibold mb-4 flex items-center gap-2 text-blue-700">
            <TagIcon className="h-6 w-6" /> Basic info
          </h2>
          <label className="block text-sm font-medium mb-1">Product title</label>
          <input
            type="text"
            value={form.title}
            maxLength={100} // Security: Max length limit
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

        {/* Pricing */}
        <div className="p-6 border rounded-lg shadow-sm bg-gray-50">
          <h2 className="text-sm xl:text-xl 2xl:text-2xl font-semibold mb-4 flex items-center gap-2 text-green-700">
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
        </div>

        {/* Variant Section */}
        <div className="p-6 border rounded-lg shadow-sm bg-gray-50 border-purple-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm xl:text-xl 2xl:text-2xl font-semibold flex items-center gap-2 text-purple-700">
              <ArchiveBoxIcon className="h-6 w-6" /> Variants & Inventory Tracking
            </h2>
            <button 
              type="button" 
              onClick={addVariant}
              className="flex items-center gap-1 bg-purple-600 text-white px-4 py-2 rounded-xl text-xs xl:text-xl 2xl:text-2xl font-bold hover:bg-purple-700 transition shadow-lg"
            >
              <PlusIcon className="h-4 w-4" /> Add Variant
            </button>
          </div>

          {form.variants.length > 0 ? (
            <div className="space-y-4">
              {form.variants.map((v, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative animate-in fade-in slide-in-from-top-2">
                  <button 
                    type="button" 
                    onClick={() => removeVariant(idx)} 
                    className="absolute top-4 right-4 text-red-400 hover:text-red-600"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Variant Name</label>
                      <input 
                        type="text" 
                        value={v.name} 
                        onChange={(e) => updateVariant(idx, "name", e.target.value)} 
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Price (Optional)</label>
                      <input 
                        type="text" 
                        value={v.price ? formatNaira(v.price) : ""} 
                        onChange={(e) => updateVariant(idx, "price", parseNaira(e.target.value))} 
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Stock</label>
                      <input 
                        type="number" 
                        value={v.stock} 
                        onChange={(e) => updateVariant(idx, "stock", Math.max(0, Number(e.target.value)))} 
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">SKU</label>
                      <input 
                        type="text" 
                        value={v.sku} 
                        onChange={(e) => updateVariant(idx, "sku", e.target.value)} 
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-2xl">
                <p className="text-gray-400 text-sm">No variants added. Sold as single item.</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-gray-200">
            <div><label className="block text-sm font-medium mb-1 text-gray-600">Base SKU</label><input type="text" value={form.sku} onChange={(e) => dispatch({ type: "SET_FIELD", field: "sku", value: e.target.value })} className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-purple-500" /></div>
            <div><label className="block text-sm font-medium mb-1 text-gray-600">Base Stock</label><input type="number" value={form.stock} onChange={(e) => dispatch({ type: "SET_FIELD", field: "stock", value: Math.max(0, Number(e.target.value)) })} className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-purple-500" /></div>
            <div><label className="block text-sm font-medium mb-1 text-gray-600">Brand Name</label><input type="text" value={form.brand} onChange={(e) => dispatch({ type: "SET_FIELD", field: "brand", value: e.target.value })} className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-purple-500" /></div>
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
                onChange={(e) => dispatch({ type: "SET_FIELD", field: "weight", value: Math.max(0, Number(e.target.value)) })}
                className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="p-6 border rounded-lg shadow-sm bg-gray-50">
          <h2 className="text-sm xl:text-xl 2xl:text-2xl font-semibold mb-2 flex items-center gap-2 text-orange-700">
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
              value: (selected ?? []).map((s: any) => sanitizeInput(s.value)),
            })}
            placeholder="Search categories..."
            className="w-full"
          />
        </div>

        {/* Images Section */}
        <div className="p-6 border rounded-lg shadow-sm bg-gray-50">
          <h2 className="text-sm xl:text-xl 2xl:text-2xl font-semibold mb-4 flex items-center gap-2 text-pink-700">
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
              <button
                  type="button"
                  onClick={removeMainImage}
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1.5 shadow-lg"
                >
                  ×
                </button>
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

        {/* Tags Section */}
        <div className="p-6 border rounded-lg shadow-sm bg-gray-50">
          <h2 className="text-sm xl:text-xl 2xl:text-2xl font-semibold mb-4 flex items-center gap-2 text-teal-700">
            <TagIcon className="h-6 w-6" /> Tags
          </h2>
          <label className="block text-sm xl:text-xl 2xl:text-2xl font-medium mb-1">Tags (comma separated)</label>
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
          <h2 className="text-sm xl:text-xl 2xl:text-2xl font-semibold mb-4 flex items-center gap-2 text-indigo-700">SEO Settings</h2>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium mb-1">Meta Title</label><input type="text" value={form.metaTitle} onChange={(e) => dispatch({ type: "SET_FIELD", field: "metaTitle", value: sanitizeInput(e.target.value) })} className="border rounded px-3 py-2 w-full" /></div>
            <div><label className="block text-sm font-medium mb-1">Meta Description</label><textarea value={form.metaDescription} onChange={(e) => dispatch({ type: "SET_FIELD", field: "metaDescription", value: sanitizeInput(e.target.value) })} className="border rounded px-3 py-2 w-full" rows={3} /></div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button type="submit" disabled={isSubmitting} className={`flex-1 ${initialData ? "bg-indigo-600" : "bg-blue-600"} text-white py-4 px-6 rounded-lg flex items-center justify-center gap-2 text-sm xl:text-xl 2xl:text-2xl font-semibold transition shadow-md disabled:opacity-50`}>
            {isSubmitting ? <ArrowPathIcon className="h-6 w-6 animate-spin" /> : (initialData ? <ArrowPathIcon className="h-6 w-6" /> : <TagIcon className="h-6 w-6" />)}
            {initialData ? "Update product" : "Save product"}
          </button>
          <button type="button" onClick={() => dispatch({ type: "RESET" })} className="flex-1 bg-gray-200 text-gray-800 py-4 px-6 rounded-lg font-semibold">Reset Form</button>
        </div>
      </form>
    </div>
  );
}