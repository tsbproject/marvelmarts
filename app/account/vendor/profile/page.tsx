import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import DashboardHeader from "@/app/_components/DashboardHeader";
import { Camera, Store, Image as ImageIcon, CheckCircle2 } from "lucide-react";

export default async function VendorProfilePage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader title="Store Settings" showLogout={true} />

      <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
        
        {/* BRANDING CUSTOMIZATION SECTION */}
        <div className="bg-neutral-white rounded-4xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-100">
            <h3 className="text-xl font-black text-accent-navy uppercase tracking-tight">Store Branding</h3>
            <p className="text-neutral-gray text-sm font-medium">Customize how your store appears to customers.</p>
          </div>

          <div className="p-8 space-y-10">
            {/* Cover Photo Upload */}
            <div className="space-y-4">
              <label className="text-xs font-black text-neutral-gray uppercase tracking-widest flex items-center gap-2">
                <ImageIcon size={14} className="text-brand-primary" /> Store Cover Photo
              </label>
              <div className="relative h-48 w-full bg-neutral-light rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center group cursor-pointer hover:bg-brand-light/20 hover:border-brand-primary/50 transition-all">
                <Camera className="text-neutral-gray group-hover:text-brand-primary mb-2" size={32} />
                <p className="text-xs font-bold text-neutral-gray">Click to upload cover image (1200x400 recommended)</p>
              </div>
            </div>

            {/* Logo and Business Info */}
            <div className="flex flex-col md:flex-row gap-10">
              <div className="space-y-4">
                <label className="text-xs font-black text-neutral-gray uppercase tracking-widest">Store Logo</label>
                <div className="relative w-32 h-32 bg-neutral-light rounded-4xl border-2 border-dashed border-gray-200 flex items-center justify-center group cursor-pointer hover:border-brand-primary/50">
                  <Store className="text-neutral-gray group-hover:text-brand-primary" size={40} />
                  <div className="absolute -bottom-2 -right-2 bg-brand-primary p-2 rounded-xl text-accent-navy shadow-lg">
                    <Camera size={16} />
                  </div>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-neutral-gray uppercase tracking-widest">Business Name</label>
                  <input 
                    type="text" 
                    defaultValue={session?.user?.name || ""}
                    className="w-full p-4 bg-neutral-light rounded-2xl border border-transparent focus:border-brand-primary focus:bg-neutral-white outline-none font-bold text-accent-navy transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-neutral-gray uppercase tracking-widest">Store Category</label>
                  <select className="w-full p-4 bg-neutral-light rounded-2xl border border-transparent focus:border-brand-primary focus:bg-neutral-white outline-none font-bold text-accent-navy transition-all appearance-none">
                    <option>Electronics</option>
                    <option>Fashion</option>
                    <option>Home & Living</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 bg-neutral-light/50 flex justify-end">
            <button className="px-10 py-4 bg-accent-navy text-neutral-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-neutral-dark transition-all flex items-center gap-2">
              <CheckCircle2 size={18} /> Save Branding Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}