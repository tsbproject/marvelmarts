"use client";

import { useState, useEffect } from "react";

interface Variant {
  id: string;
  name: string;
  price: number | null;
  stock: number | null;
  attributes?: Record<string, string>;
}

export function VariantsTab({ slug }: { slug: string }) {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [newVariant, setNewVariant] = useState({
    name: "",
    price: 0,
    stock: 0,
  });

  // Fetch variants
  useEffect(() => {
    fetch(`/api/products/${slug}/variants`)
      .then((res) => res.json())
      .then(setVariants)
      .catch((err) => console.error("Error fetching variants:", err));
  }, [slug]);

  // Add new variant
  async function handleAddVariant(e: React.FormEvent) {
    e.preventDefault();
    if (!newVariant.name) return;

    const res = await fetch(`/api/products/${slug}/variants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newVariant),
    });

    if (res.ok) {
      const variant = await res.json();
      setVariants((prev) => [...prev, variant]);
      setNewVariant({ name: "", price: 0, stock: 0 });
    } else {
      alert("Error adding variant");
    }
  }

  // Delete variant
  async function handleDeleteVariant(id: string) {
    const res = await fetch(`/api/products/${slug}/variants?id=${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      setVariants((prev) => prev.filter((v) => v.id !== id));
    } else {
      alert("Error deleting variant");
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Product Variants</h2>

      {/* Add variant form */}
      <form onSubmit={handleAddVariant} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Variant name"
          value={newVariant.name}
          onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
          className="input flex-1"
        />
        <input
          type="number"
          placeholder="Price"
          value={newVariant.price}
          onChange={(e) =>
            setNewVariant({ ...newVariant, price: Number(e.target.value) })
          }
          className="input w-24"
        />
        <input
          type="number"
          placeholder="Stock"
          value={newVariant.stock}
          onChange={(e) =>
            setNewVariant({ ...newVariant, stock: Number(e.target.value) })
          }
          className="input w-24"
        />
        <button type="submit" className="btn btn-primary">
          Add
        </button>
      </form>

      {/* Variants list */}
      {variants.length === 0 ? (
        <p>No variants yet.</p>
      ) : (
        <table className="table-auto w-full border">
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Attributes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {variants.map((v) => (
              <tr key={v.id}>
                <td>{v.name}</td>
                <td>{v.price ?? "-"}</td>
                <td>{v.stock ?? "-"}</td>
                <td>
                  {v.attributes
                    ? Object.entries(v.attributes)
                        .map(([k, val]) => `${k}: ${val}`)
                        .join(", ")
                    : "-"}
                </td>
                <td>
                  <button
                    onClick={() => handleDeleteVariant(v.id)}
                    className="btn btn-sm btn-danger"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
