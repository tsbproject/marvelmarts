"use client";

import React, { useEffect, useId, useReducer, useState } from "react";
import Select, { GroupBase } from "react-select";
import {
  TagIcon,
  CurrencyDollarIcon,
  Squares2X2Icon,
  PhotoIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/outline";

interface Category {
  id: string;
  name: string;
  parentId?: string | null;
}

interface ProductFormProps {
  onSubmit: (payload: FormData) => Promise<void>;
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

type ProductFormState = {
  title: string;
  description: string;
  price: number;
  discountPrice: number;
  status: string;
  categories: string[];
  sku: string;
  stock: number;
  brand: string;
  tags: string[];
  mainImage: File | null;
  extraImages: File[];
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

export default function ProductForm({ onSubmit }: ProductFormProps) {
  const [form, dispatch] = useReducer(formReducer, initialFormState);
  const [categories, setCategories] = useState<Category[]>([]);
  const [previewMain, setPreviewMain] = useState<string | null>(null);
  const [previewExtras, setPreviewExtras] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [isDraggingMain, setIsDraggingMain] = useState(false);
  const [isDraggingExtra, setIsDraggingExtra] = useState(false);

  const selectInstanceId = useId();
  const selectInputId = `${selectInstanceId}-input`;
  const selectPlaceholderId = `${selectInstanceId}-placeholder`;

  useEffect(() => {
    let mounted = true;
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories", { cache: "no-store" });
        if (!mounted) return;
        if (res.ok) {
          const data = await res.json();
          setCategories(Array.isArray(data) ? data : data.items ?? []);
        }
      } catch {
        // optional error handling
      }
    }
    fetchCategories();
    return () => {
      mounted = false;
    };
  }, []);

  function handleMainImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    dispatch({ type: "SET_MAIN_IMAGE", file });
    setPreviewMain(URL.createObjectURL(file));
  }

  function handleExtraImagesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    dispatch({ type: "SET_EXTRA_IMAGES", files });
    setPreviewExtras(files.map((f) => URL.createObjectURL(f)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.title.trim()) {
      setError("Product title is required.");
      return;
    }
    if (form.price <= 0) {
      setError("Price must be greater than zero.");
      return;
    }
    if (form.discountPrice && form.discountPrice >= form.price) {
      setError("Discount price must be less than the regular price.");
      return;
    }
    if (form.categories.length === 0) {
      setError("Please select at least one category or subcategory.");
      return;
    }

    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("price", String(form.price));
    fd.append("discountPrice", String(form.discountPrice || 0));
    fd.append("status", form.status);
    fd.append("categoryId", form.categories[0]);
    fd.append("stock", String(form.stock));
    fd.append("brand", form.brand);
    fd.append("tags", JSON.stringify(form.tags));

    if (form.sku.trim()) fd.append("sku", form.sku.trim());
    if (form.metaTitle.trim()) fd.append("metaTitle", form.metaTitle.trim());
    if (form.metaDescription.trim()) fd.append("metaDescription", form.metaDescription.trim());

    if (form.mainImage) fd.append("mainImage", form.mainImage);
    form.extraImages.forEach((file) => fd.append("extraImages", file));

    await onSubmit(fd);
  }

  type Option = { value: string; label: string };
  type GroupedOption = { label: string; options: Option[] };
  const groupedOptions: GroupedOption[] = categories
    .filter((c) => !c.parentId)
    .map((parent) => ({
      label: parent.name,
      options: categories
        .filter((child) => child.parentId === parent.id)
        .map((child) => ({ value: child.id, label: child.name })),
    }))
    .filter((group) => group.options.length > 0);

  const flatOptions: Option[] = groupedOptions.flatMap((g) => g.options);
  const selectedValue = flatOptions.filter((opt) =>
    form.categories.includes(opt.value)
  );

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-center text-3xl md:text-5xl font-bold mb-8 text-gray-800">
        Create Product
      </h1>

      <form onSubmit={handleSubmit} className="space-y-10">
        {error && (
          <div className="text-red-700 bg-red-50 border border-red-200 p-3 rounded">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <div className="p-6 border rounded-lg shadow-sm bg-gray-50">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-blue-700">
            <TagIcon className="h-6 w-6" />
            Basic info
          </h2>
          <label className="block text-sm font-medium mb-1">Product title</label>
          <input
            type="text"
            placeholder="e.g. Nike Air Max Sneakers"
            value={form.title}
            onChange={(e) =>
              dispatch({ type: "SET_FIELD", field: "title", value: e.target.value })
            }
            className="border rounded px-3 py-2 w-full mb-4 focus:ring-2 focus:ring-blue-500"
            required
          />
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            placeholder="Detailed product description..."
            value={form.description}
            onChange={(e) =>
              dispatch({ type: "SET_FIELD", field: "description", value: e.target.value })
            }
            className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
        </div>

               {/* Pricing */}
        <div className="p-6 border rounded-lg shadow-sm bg-gray-50">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-green-700">
            <CurrencyDollarIcon className="h-6 w-6" />
            Pricing (₦ NGN)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Price (₦)</label>
              <input
                type="text"
                placeholder="₦25,000"
                value={form.price ? formatNaira(form.price) : ""}
                onChange={(e) =>
                  dispatch({ type: "SET_FIELD", field: "price", value: parseNaira(e.target.value) })
                }
                className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Discount price (₦)</label>
              <input
                type="text"
                placeholder="₦20,000"
                value={form.discountPrice ? formatNaira(form.discountPrice) : ""}
                onChange={(e) =>
                  dispatch({ type: "SET_FIELD", field: "discountPrice", value: parseNaira(e.target.value) })
                }
                className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) =>
                  dispatch({ type: "SET_FIELD", field: "status", value: e.target.value })
                }
                className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-green-500"
              >
                <option value="ACTIVE">Active</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* Categories & Subcategories */}
        <div className="p-6 border rounded-lg shadow-sm bg-gray-50">
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2 text-orange-700">
            <Squares2X2Icon className="h-6 w-6" />
            Categories & subcategories
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Choose subcategories under their parent groups. You can select multiple.
          </p>
          <Select<Option, true, GroupBase<Option>>
            key="product-categories-select"
            instanceId={selectInstanceId}
            inputId={selectInputId}
            aria-describedby={selectPlaceholderId}
            isMulti
            options={groupedOptions}
            value={selectedValue}
            onChange={(selected) =>
              dispatch({
                type: "SET_FIELD",
                field: "categories",
                value: (selected ?? []).map((s) => s.value),
              })
            }
            placeholder="Select subcategories..."
            className="w-full"
            classNamePrefix="select"
          />
          <span id={selectPlaceholderId} className="sr-only">
            Select subcategories...
          </span>
          {form.categories.length > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              Selected: {form.categories.length} item(s)
            </p>
          )}
        </div>

        {/* Images */}
        <div className="p-6 border rounded-lg shadow-sm bg-gray-50">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-pink-700">
            <PhotoIcon className="h-6 w-6" />
            Product images
          </h2>

          {/* Main image */}
          <label className="block text-sm font-medium mb-1">Main image</label>
          <label
            htmlFor="mainImageUpload"
            onDragEnter={() => setIsDraggingMain(true)}
            onDragLeave={() => setIsDraggingMain(false)}
            onDrop={() => setIsDraggingMain(false)}
            className={`cursor-pointer flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 bg-gray-50 text-center transition ${
              isDraggingMain ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-500"
            }`}
          >
            <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M4 12l4-4m0 0l4 4m-4-4v12" />
            </svg>
            <p className="text-sm text-gray-600">Upload a File</p>
            <p className="text-xs text-gray-500">Click or drag and drop files here</p>
          </label>
          <input id="mainImageUpload" type="file" accept="image/*" onChange={handleMainImageChange} className="hidden" />
          {previewMain && (
            <img src={previewMain} alt="Main preview" className="mt-3 h-48 w-full object-cover rounded border shadow-sm" />
          )}

          {/* Extra images */}
          <label className="block text-sm font-medium mt-4 mb-1">Extra images</label>
          <label
            htmlFor="extraImagesUpload"
            onDragEnter={() => setIsDraggingExtra(true)}
            onDragLeave={() => setIsDraggingExtra(false)}
            onDrop={() => setIsDraggingExtra(false)}
            className={`cursor-pointer flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 bg-gray-50 text-center transition ${
              isDraggingExtra ? "border-pink-500 bg-pink-50" : "border-gray-300 hover:border-pink-500"
            }`}
          >
            <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M4 12l4-4m0 0l4 4m-4-4v12" />
            </svg>
            <p className="text-sm text-gray-600">Upload Files</p>
            <p className="text-xs text-gray-500">Click or drag and drop multiple images</p>
          </label>
          <input id="extraImagesUpload" type="file" accept="image/*" multiple onChange={handleExtraImagesChange} className="hidden" />
          {previewExtras.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              {previewExtras.map((src, idx) => (
                <img key={idx} src={src} alt={`Extra preview ${idx + 1}`} className="h-28 w-full object-cover rounded-lg border shadow-sm" />
              ))}
            </div>
          )}
        </div>

        {/* Inventory & Branding */}
        <div className="p-6 border rounded-lg shadow-sm bg-gray-50">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-purple-700">
            <ArchiveBoxIcon className="h-6 w-6" />
            Inventory & branding
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">SKU</label>
              <input
                type="text"
                placeholder="e.g. NIKE-AMAX-001"
                value={form.sku}
                onChange={(e) =>
                  dispatch({ type: "SET_FIELD", field: "sku", value: e.target.value })
                }
                className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stock</label>
              <input
                type="number"
                placeholder="e.g. 50"
                value={form.stock}
                onChange={(e) =>
                  dispatch({ type: "SET_FIELD", field: "stock", value: Number(e.target.value) })
                }
                className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Brand</label>
              <input
                type="text"
                placeholder="e.g. Nike"
                value={form.brand}
                onChange={(e) =>
                  dispatch({ type: "SET_FIELD", field: "brand", value: e.target.value })
                }
                className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="p-6 border rounded-lg shadow-sm bg-gray-50">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-teal-700">
            <TagIcon className="h-6 w-6" />
            Tags
          </h2>
          <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
          <input
            type="text"
            placeholder="e.g. sneakers, running, sports"
            value={form.tags.join(", ")}
            onChange={(e) =>
              dispatch({
                type: "SET_FIELD",
                field: "tags",
                value: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
              })
            }
            className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* SEO Section */}
        <div className="p-6 border rounded-lg shadow-sm bg-gray-50">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-indigo-700">
            SEO Settings
          </h2>
          <div>
            <label className="block text-sm font-medium mb-1">Meta Title</label>
            <input
              type="text"
              placeholder="Optional SEO title"
              value={form.metaTitle}
              onChange={(e) =>
                dispatch({ type: "SET_FIELD", field: "metaTitle", value: e.target.value })
              }
              className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Meta Description</label>
            <textarea
              placeholder="Optional SEO description"
              value={form.metaDescription}
              onChange={(e) =>
                dispatch({ type: "SET_FIELD", field: "metaDescription", value: e.target.value })
              }
              className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-indigo-500"
              rows={3}
            />
          </div>
        </div>

       
        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-4 px-6 rounded-lg flex items-center justify-center gap-2 text-lg font-semibold hover:bg-blue-700 transition shadow-md"
          >
            <TagIcon className="h-6 w-6" />
            Save product
          </button>

          <button
            type="button"
            onClick={() => {
              dispatch({ type: "RESET" });
              setPreviewMain(null);
              setPreviewExtras([]);
            }}
            className="flex-1 bg-gray-200 text-gray-800 py-4 px-6 rounded-lg flex items-center justify-center gap-2 text-lg font-semibold hover:bg-gray-300 transition shadow-md"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}

