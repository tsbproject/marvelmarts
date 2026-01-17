"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, X, Info } from "lucide-react";

export default function NewArticlePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title"),
      category: formData.get("category"),
      excerpt: formData.get("excerpt"),
      content: formData.get("content"),
      keywords: (formData.get("keywords") as string).split(",").map(k => k.trim()),
      slug: (formData.get("title") as string).toLowerCase().replace(/ /g, "-"),
    };

    const res = await fetch("/api/support/articles", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push("/dashboard/admins/support");
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div className="p-8 max-w-4xl">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-black text-gray-900 uppercase">New Article</h1>
          <div className="flex gap-3">
            <button type="button" onClick={() => router.back()} className="px-6 py-3 rounded-2xl border border-gray-200 font-bold hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading} className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 disabled:opacity-50">
              <Save size={20} />
              {loading ? "Saving..." : "Save Article"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-gray-400 ml-2">Title</label>
            <input name="title" required className="w-full p-4 rounded-2xl border border-gray-100 bg-white focus:ring-4 focus:ring-blue-500/5 outline-none font-bold" placeholder="e.g. How to track my order" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase text-gray-400 ml-2">Category</label>
            <select name="category" className="w-full p-4 rounded-2xl border border-gray-100 bg-white outline-none font-bold">
              <option>Shipping</option>
              <option>Payments</option>
              <option>Account</option>
              <option>Returns</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase text-gray-400 ml-2">Excerpt (Short Summary)</label>
          <textarea name="excerpt" rows={2} required className="w-full p-4 rounded-2xl border border-gray-100 bg-white outline-none" />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black uppercase text-gray-400 ml-2">Full Content</label>
          <textarea name="content" rows={10} required className="w-full p-4 rounded-2xl border border-gray-100 bg-white outline-none font-mono text-sm" placeholder="Write your article here..." />
        </div>

        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3 text-blue-700">
          <Info size={20} className="shrink-0" />
          <p className="text-xs font-medium">Keywords should be comma-separated. These help your search bar find articles faster (e.g., ship, delivery, tracking).</p>
        </div>

        <input name="keywords" className="w-full p-4 rounded-2xl border border-gray-100 bg-white outline-none" placeholder="track, delivery, status" />
      </form>
    </div>
  );
}