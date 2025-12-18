"use client";

import { useState } from "react";

export default function CategoryForm() {
  const [slug, setSlug] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleBlur = async () => {
    if (!slug) return;
    const res = await fetch(`/api/categories/check-slug?slug=${slug}`);
    const data = await res.json();
    if (data.exists) {
      setShowModal(true);
    }
  };

  const autoAppendSlug = () => {
    let counter = 2;
    let newSlug = `${slug}-${counter}`;
    setSlug(newSlug);
    setShowModal(false);
  };

  return (
    <div>
      <label className="block mb-2">Slug</label>
      <input
        type="text"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        onBlur={handleBlur}
        className="border px-2 py-1 rounded w-full"
      />

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-lg font-bold mb-4">Slug Conflict</h2>
            <p className="mb-4">Slug already in use. Choose another.</p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={autoAppendSlug}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Auto‑append (-2)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
