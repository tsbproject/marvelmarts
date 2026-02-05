// app/dashboard/admins/categories/create/CreateCategoryClient.tsx
"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/app/_context/NotificationContext";
import { useLoadingOverlay } from "@/app/_context/LoadingOverlayContext";
import { updateCategoryAction } from "@/app/services/adminCategoryActions"; // We use the same action for upsert logic if preferred, or create a specific createAction
import CategoryIconUpload from "../_components/CategoryIconUpload"; 
import { Plus, Loader2, ShieldCheck, Zap, Globe, ChevronLeft } from "lucide-react";

function generateSlug(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
}

export default function CreateCategoryClient({ initialParentOptions }: { initialParentOptions: any[] }) {
  const router = useRouter();
  const { notifySuccess, notifyError } = useNotification();
  const { setLoading: setGlobalLoading } = useLoadingOverlay();
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    name: "",
    slug: "",
    parentId: "",
    position: 0,
    imageUrl: "",
    isFeatured: false,
    metaTitle: "",
    metaDescription: "",
  });

  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);

  // Auto-generate slug when name changes
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = generateSlug(name);
    setForm(prev => ({ ...prev, name, slug }));
    validateSlug(slug);
  };

  const validateSlug = async (slug: string) => {
    if (!slug) return;
    const res = await fetch(`/api/admins/categories/check-slug?slug=${slug}`);
    const data = await res.json();
    setSlugAvailable(!data.exists);
  };

  // Conflict Resolution logic from your existing code
  async function resolveSlugConflict(baseSlug: string): Promise<string> {
    let candidate = baseSlug;
    let counter = 2;
    while (true) {
      const res = await fetch(`/api/admins/categories/check-slug?slug=${candidate}`);
      const data = await res.json();
      if (!data.exists) return candidate;
      candidate = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalLoading(true);

    startTransition(async () => {
      let resolvedSlug = form.slug;
      
      // Double check conflict before final submission
      const resCheck = await fetch(`/api/admins/categories/check-slug?slug=${form.slug}`);
      const dataCheck = await resCheck.json();
      if (dataCheck.exists) {
        resolvedSlug = await resolveSlugConflict(form.slug);
        notifyError(`Conflict: Using "${resolvedSlug}" to maintain registry integrity.`);
      }

      // We'll use a placeholder 'new' id for the creation action if it handles creation, 
      // or ensure you have a createCategoryAction in your services.
      // Assuming updateCategoryAction can handle new entries or you have a create equivalent:
      const result = await fetch("/api/admins/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, slug: resolvedSlug }),
      });

      if (result.ok) {
        notifySuccess("Tactical Category Registered.");
        router.push("/dashboard/admins/categories");
        router.refresh();
      } else {
        const data = await result.json();
        notifyError(data.error || "Registry Failure.");
      }
      setGlobalLoading(false);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
      <div className="lg:col-span-2 space-y-6">
        {/* IDENTITY BLOCK */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-600 tracking-widest">
            <ShieldCheck size={14} /> Core Identity
          </div>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Classification Name (e.g. Tactical Apparel)"
              value={form.name}
              onChange={handleNameChange}
              className="w-full bg-gray-50 border-none rounded-2xl p-4 text-xl font-black focus:ring-2 focus:ring-blue-600 transition-all"
              required
            />
            <div className="relative">
              <input
                type="text"
                placeholder="url-identifier"
                value={form.slug}
                onChange={(e) => {
                  setForm({...form, slug: e.target.value});
                  validateSlug(e.target.value);
                }}
                className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm font-mono focus:ring-2 focus:ring-blue-600"
                required
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {slugAvailable === true && <span className="text-[9px] font-black text-green-500 uppercase">Available</span>}
                {slugAvailable === false && <span className="text-[9px] font-black text-red-500 uppercase">Taken</span>}
              </div>
            </div>
          </div>
        </div>

        {/* SEO BLOCK */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 tracking-widest">
            <Globe size={14} /> Search Intelligence
          </div>
          <input 
            type="text" 
            placeholder="Meta Title"
            value={form.metaTitle}
            onChange={(e) => setForm({...form, metaTitle: e.target.value})}
            className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold"
          />
          <textarea 
            placeholder="Meta Description"
            value={form.metaDescription}
            onChange={(e) => setForm({...form, metaDescription: e.target.value})}
            className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-medium h-24 resize-none"
          />
        </div>
      </div>

      {/* SIDEBAR BLOCK */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <CategoryIconUpload 
            initialValue={form.imageUrl} 
            onChange={(url) => setForm({ ...form, imageUrl: url })} 
          />

          <div className="space-y-4">
             <div 
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                    form.isFeatured ? 'bg-blue-600 border-blue-700 shadow-lg' : 'bg-gray-50 border-gray-100'
                }`}
                onClick={() => setForm({...form, isFeatured: !form.isFeatured})}
             >
                <div className="flex items-center gap-2">
                  <Zap size={16} className={form.isFeatured ? 'text-white' : 'text-gray-400'} />
                  <span className={`text-[10px] font-black uppercase ${form.isFeatured ? 'text-white' : 'text-gray-500'}`}>Featured</span>
                </div>
                <div className={`w-2 h-2 rounded-full ${form.isFeatured ? 'bg-white' : 'bg-gray-300'}`} />
             </div>

             <select
                value={form.parentId}
                onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-xl p-4 text-xs font-black uppercase"
              >
                <option value="">No Parent</option>
                {initialParentOptions.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            {isPending ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
            Create Category
          </button>
          
          <button 
            type="button"
            onClick={() => router.back()}
            className="w-full text-[10px] font-black uppercase text-gray-400 flex items-center justify-center gap-1 hover:text-gray-600 transition-colors"
          >
            <ChevronLeft size={12} /> Discard Registry
          </button>
        </div>
      </div>
    </form>
  );
}