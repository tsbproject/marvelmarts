"use client";

import { useState } from "react";
import { completeStoreSetup } from "@/app/lib/actions/vendor-unboarding";
import { useNotification } from "@/app/_context/NotificationContext";
import { useRouter } from "next/navigation";
import { Store, Globe, AlignLeft, Sparkles } from "lucide-react";

export default function StoreSetupForm({ vendorId, initialData }: any) {
  const [loading, setLoading] = useState(false);
  const { notifySuccess, notifyError } = useNotification();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await completeStoreSetup(vendorId, formData);

    if (result?.success) {
      notifySuccess("Store identity secured! Redirecting...");
      router.push("/account/vendor");
      router.refresh();
    } else {
      notifyError(result?.error || "Failed to update store");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 md:p-10 rounded-4xl border border-gray-100 shadow-2xl">
      
      {/* Store Name */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-xs font-black uppercase text-accent-navy ml-1">
          <Store size={14} className="text-brand-primary" />
          Public Store Name
        </label>
        <input 
          name="name" 
          defaultValue={initialData.name}
          placeholder="e.g. Tayo's Premium Gadgets"
          className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-brand-primary focus:bg-white transition-all outline-none font-bold text-accent-navy" 
          required 
        />
      </div>

      {/* Store Slug */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-xs font-black uppercase text-accent-navy ml-1">
          <Globe size={14} className="text-brand-primary" />
          Unique Store URL (Slug)
        </label>
        <div className="relative flex items-center">
          <span className="absolute left-4 text-neutral-gray text-sm font-medium border-r border-gray-200 pr-3">
            marvelmarts.com/store/
          </span>
          <input 
            name="slug" 
            defaultValue={initialData.slug}
            placeholder="tayo-gadgets"
            className="w-full p-4 pl-[175px] bg-gray-50 rounded-2xl border-2 border-transparent focus:border-brand-primary focus:bg-white transition-all outline-none font-bold text-brand-primary" 
            required 
          />
        </div>
        <p className="text-[10px] text-neutral-gray font-bold uppercase ml-1">
          No spaces or special characters. This is how customers find you.
        </p>
      </div>

      {/* Store Bio */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-xs font-black uppercase text-accent-navy ml-1">
          <AlignLeft size={14} className="text-brand-primary" />
          Store Bio / Description
        </label>
        <textarea 
          name="bio" 
          defaultValue={initialData.bio}
          placeholder="Tell customers what makes your store special..."
          rows={4}
          className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-brand-primary focus:bg-white transition-all outline-none font-medium text-accent-navy resize-none" 
        />
      </div>

      {/* Submit Button */}
      <button 
        type="submit"
        disabled={loading}
        className="w-full group relative overflow-hidden py-5 bg-accent-navy text-neutral-white rounded-3xl font-black uppercase tracking-widest hover:bg-brand-primary hover:text-accent-navy transition-all shadow-xl disabled:opacity-50"
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {loading ? "Saving Identity..." : "Complete Store Setup"}
          {!loading && <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />}
        </span>
      </button>
    </form>
  );
}