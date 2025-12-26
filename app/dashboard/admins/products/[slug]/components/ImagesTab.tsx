"use client";

import { useState, useEffect } from "react";

interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  order?: number;
}

export function ImagesTab({ slug }: { slug: string }) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");

  // Fetch images
  useEffect(() => {
    fetch(`/api/products/${slug}/images`)
      .then((res) => res.json())
      .then(setImages)
      .catch((err) => console.error("Error fetching images:", err));
  }, [slug]);

  // Add new image
  async function handleAddImage(e: React.FormEvent) {
    e.preventDefault();
    if (!newImageUrl) return;

    const res = await fetch(`/api/products/${slug}/images`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: newImageUrl }),
    });

    if (res.ok) {
      const img = await res.json();
      setImages((prev) => [...prev, img]);
      setNewImageUrl("");
    } else {
      alert("Error adding image");
    }
  }

  // Delete image
  async function handleDeleteImage(id: string) {
    const res = await fetch(`/api/products/${slug}/images?id=${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setImages((prev) => prev.filter((img) => img.id !== id));
    } else {
      alert("Error deleting image");
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Product Images</h2>

      {/* Upload form */}
      <form onSubmit={handleAddImage} className="flex gap-2 mb-4">
        <input
          type="url"
          placeholder="Image URL"
          value={newImageUrl}
          onChange={(e) => setNewImageUrl(e.target.value)}
          className="input flex-1"
        />
        <button type="submit" className="btn btn-primary">
          Add
        </button>
      </form>

      {/* Image list */}
      {images.length === 0 ? (
        <p>No images yet.</p>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {images.map((img) => (
            <div key={img.id} className="border p-2 rounded">
              <img
                src={img.url}
                alt={img.alt ?? "Product image"}
                className="w-full h-32 object-cover mb-2"
              />
              <button
                onClick={() => handleDeleteImage(img.id)}
                className="btn btn-sm btn-danger w-full"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
