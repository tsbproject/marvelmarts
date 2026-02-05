// app/dashboard/admins/categories/[id]/edit/EditCategoryClient.tsx
"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/app/_context/NotificationContext";
import { useLoadingOverlay } from "@/app/_context/LoadingOverlayContext";
import { updateCategoryAction } from "@/app/services/adminCategoryActions";
import CategoryIconUpload from "../../_components/CategoryIconUpload"; 
import { Save, Loader2, ShieldCheck, Zap, Globe, ChevronLeft } from "lucide-react";

function generateSlug(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
}

export default function EditCategoryClient({ initialData, parentOptions }: any) {
  const router = useRouter();
  const { notifySuccess, notifyError } = useNotification();
  const { setLoading: setGlobalLoading } = useLoadingOverlay();
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    name: initialData.name || "",
    slug: initialData.slug || "",
    parentId: initialData.parentId || "",
    position: initialData.position || 0,
    imageUrl: initialData.imageUrl || "",
    isFeatured: !!initialData.isFeatured,
    metaTitle: initialData.metaTitle || "",
    metaDescription: initialData.metaDescription || "",
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = generateSlug(name);
    setForm(prev => ({ ...prev, name, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalLoading(true);

    startTransition(async () => {
      const result = await updateCategoryAction(initialData.id, form);
      
      if (result.success) {
        notifySuccess("Registry Updated Successfully.");
        router.push("/dashboard/admins/categories");
        router.refresh(); // Crucial for updating the list view
      } else {
        notifyError(result.error);
      }
      setGlobalLoading(false);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      {/* PRIMARY COLUMN */}
      <div className="lg:col-span-2 space-y-6 max-w-7xl">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-600 tracking-widest">
            <ShieldCheck size={14} /> Core Identity
          </div>
          
          <div className="space-y-4">
            <input
              type="text"
              value={form.name}
              onChange={handleNameChange}
              placeholder="Classification Name"
              className="w-full bg-gray-50 border-none rounded-2xl p-4 text-xl font-black focus:ring-2 focus:ring-blue-600 transition-all"
              required
            />
            <div className="relative">
                <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({...form, slug: e.target.value})}
                    placeholder="URL-slug"
                    className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm font-mono focus:ring-2 focus:ring-blue-600"
                />
            </div>
          </div>
        </div>

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

      {/* SIDEBAR */}
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
                <div className={`w-4 h-4 rounded-full border-2 ${form.isFeatured ? 'bg-white border-white' : 'border-gray-300'}`} />
             </div>

             <select
                value={form.parentId}
                onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                className="w-full bg-gray-50 border-none rounded-xl p-4 text-xs font-black uppercase"
              >
                <option value="">Parent Category</option>
                {parentOptions.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-2"
          >
            {isPending ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Execute Update
          </button>
          
          <button 
            type="button"
            onClick={() => router.back()}
            className="w-full text-[10px] font-black uppercase text-gray-400 flex items-center justify-center gap-1 hover:text-gray-600 transition-colors"
          >
            <ChevronLeft size={12} /> Discard Changes
          </button>
        </div>
      </div>
    </form>
  );
}