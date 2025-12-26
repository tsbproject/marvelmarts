"use client";

import React, { useState, useEffect } from "react";
import {
  TagIcon,
  CurrencyDollarIcon,
  ArchiveBoxIcon,
  Squares2X2Icon,
  PhotoIcon,
} from "@heroicons/react/24/outline";

interface Category {
  id: string;
  name: string;
}

interface ProductFormProps {
  onSubmit: (fd: FormData) => Promise<void>;
}

export default function ProductForm({ onSubmit }: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [previewMain, setPreviewMain] = useState<string | null>(null);
  const [previewExtras, setPreviewExtras] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: 0,
    discountPrice: 0,
    status: "ACTIVE",
    categoryId: "",
    sku: "",
    stock: 0,
    brand: "",
    tags: [] as string[],
    mainImage: null as File | null,
    extraImages: [] as File[],
  });

  useEffect(() => {
    async function fetchCategories() {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : data.items ?? []);
      }
    }
    fetchCategories();
  }, []);

  function handleMainImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError("Main image must be smaller than 2MB");
        return;
      }
      setForm({ ...form, mainImage: file });
      setPreviewMain(URL.createObjectURL(file));
      setError(null);
    }
  }

  function handleExtraImagesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const validFiles: File[] = [];
    const previews: string[] = [];

    files.forEach((file) => {
      if (file.type.startsWith("image/") && file.size <= 2 * 1024 * 1024) {
        validFiles.push(file);
        previews.push(URL.createObjectURL(file));
      }
    });

    setForm({ ...form, extraImages: validFiles });
    setPreviewExtras(previews);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === "tags") fd.append(key, JSON.stringify(value));
        else if (key === "mainImage") fd.append("mainImage", value as Blob);
        else if (key === "extraImages") {
          (value as File[]).forEach((file) => fd.append("extraImages", file));
        } else fd.append(key, String(value));
      }
    });

    await onSubmit(fd);
  }

  return (
    <form onSubmit={handleSubmit} className=" space-y-8 max-w-3xl">
      {error && <div className="text-red-600">{error}</div>}

      {/* Basic Info */}
      <div className="p-4 border  rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TagIcon className="h-5 w-5 text-blue-600" />
          Basic Info
        </h2>
        <input
          type="text"
          placeholder="Product Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="border rounded px-3 py-2 w-full mb-3"
          required
        />
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="border rounded px-3 py-2 w-full"
          rows={3}
        />
      </div>

      {/* Pricing */}
      <div className="p-4 border rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CurrencyDollarIcon className="h-5 w-5 text-green-600" />
          Pricing
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            className="border rounded px-3 py-2 w-full"
            required
          />
          <input
            type="number"
            placeholder="Discount Price"
            value={form.discountPrice}
            onChange={(e) =>
              setForm({ ...form, discountPrice: Number(e.target.value) })
            }
            className="border rounded px-3 py-2 w-full"
          />
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="border rounded px-3 py-2 w-full"
          >
            <option value="ACTIVE">Active</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* Category */}
      <div className="p-4 border rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Squares2X2Icon className="h-5 w-5 text-orange-600" />
          Category
        </h2>
        <select
          value={form.categoryId}
          onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          className="border rounded px-3 py-2 w-full"
          required
        >
          <option value="">Select a category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Images */}
      <div className="p-4 border rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <PhotoIcon className="h-5 w-5 text-pink-600" />
          Product Images
        </h2>

        {/* Main Image */}
        <label className="block text-sm font-medium mb-1">Main Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleMainImageChange}
          className="border rounded px-3 py-2 w-full"
        />
        {previewMain && (
          <img
            src={previewMain}
            alt="Main Preview"
            className="mt-3 h-40 w-full object-cover rounded border"
          />
        )}

        {/* Extra Images */}
        <label className="block text-sm font-medium mt-4 mb-1">Extra Images</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleExtraImagesChange}
          className="border rounded px-3 py-2 w-full"
        />
        {previewExtras.length > 0 && (
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
            {previewExtras.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt={`Extra Preview ${idx + 1}`}
                className="h-24 w-full object-cover rounded border"
              />
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition"
      >
        <TagIcon className="h-5 w-5" />
        Save Product
      </button>
    </form>
  );
}
