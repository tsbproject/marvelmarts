export const API_BASE = "https://fakestoreapi.com"; // temporary

// ✅ Fetch all products
export async function getAllProducts() {
  const res = await fetch(`${API_BASE}/products`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

// ✅ Fetch limited products for flash sales
export async function getFlashProducts(limit = 6) {
  try {
    const res = await fetch(`https://fakestoreapi.com/products?limit=${limit}`);
    if (!res.ok) throw new Error("Failed to fetch flash products");
    return await res.json();
  } catch (err) {
    console.error("Flash products error:", err);
    return [];
  }
}


// ✅ Fetch new arrivals (sorted descending)
export async function getNewArrivals(limit = 8) {
  const res = await fetch(`${API_BASE}/products?sort=desc`);
  if (!res.ok) throw new Error("Failed to fetch new arrivals");
  const data = await res.json();
  return data.slice(0, limit);
}
