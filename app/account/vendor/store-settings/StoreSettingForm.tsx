"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { updateVendorSettings } from "@/store/vendorSlice";
import confetti from "canvas-confetti";
import DashboardHeader from "@/app/_components/DashboardHeader";
import { Camera, Store, CheckCircle2, Loader2, CreditCard, Globe, ShieldCheck, Link as LinkIcon } from "lucide-react";
import { useNotification } from "@/app/_context/NotificationContext";

export default function StoreSettingsForm({ vendor, initialStoreData }: any) {
  const { data: session, update } = useSession();
  const { notifySuccess, notifyError } = useNotification();
  const dispatch = useDispatch<AppDispatch>();

  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<"logo" | "cover" | null>(null);

  // Unified State including the Slug (URL)
  const [formData, setFormData] = useState({
    logoUrl: vendor.logoUrl || "",
    coverUrl: vendor.coverUrl || "",
    bio: vendor.bio || initialStoreData?.description || "",
    storeName: vendor.storeName || initialStoreData?.name || "",
    slug: initialStoreData?.slug || "", // Added from Store-setup
    instagram: vendor.instagram || "",
    whatsapp: vendor.whatsapp || "",
    facebook: vendor.facebook || "",
    bankName: vendor.bankName || "",
    accountNumber: vendor.accountNumber || "",
    accountName: vendor.accountName || "",
  });

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Auto-generate slug from Store Name
useEffect(() => {
  // Only auto-generate if there is a storeName and the slug is empty 
  // or was previously auto-generated (you can refine this logic if needed)
  if (formData.storeName && !initialStoreData?.slug) {
    const generatedSlug = formData.storeName
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-')  // Replace spaces/underscores with a single hyphen
      .replace(/^-+|-+$/g, '');  // Trim hyphens from ends

    setFormData(prev => ({ ...prev, slug: generatedSlug }));
  }
}, [formData.storeName, initialStoreData?.slug]);

  // --- Image Upload Logic (Kept from Store-settings) ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "cover") => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(type);
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "marvelmartsupload");
    data.append("folder", `vendors/${vendor.id}/branding`);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: data,
      });
      const fileData = await res.json();
      if (fileData.secure_url) {
        setFormData(prev => ({ ...prev, [type === "logo" ? "logoUrl" : "coverUrl"]: fileData.secure_url }));
        notifySuccess("Image uploaded!");
      }
    } catch (err) {
      notifyError("Upload failed.");
    } finally {
      setUploading(null);
    }
  };



        const handleSave = async () => {
          setLoading(true);

          try {
            const isBrandingComplete = !!(
              formData.logoUrl &&
              formData.coverUrl &&
              formData.storeName &&
              formData.slug
            );

            const isPayoutComplete = !!(
              formData.bankName &&
              formData.accountNumber.length >= 10 &&
              formData.accountName
            );

            const payload = {
              ...formData,
              storeDone: isBrandingComplete,
              payoutsDone: isPayoutComplete,
            };

            await dispatch(updateVendorSettings(payload)).unwrap();

            console.log("Saved payload:", payload);

            if (isBrandingComplete && isPayoutComplete) {
              confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ["#F7931E", "#002B5B"],
              });
            }

            notifySuccess("All store settings updated!");

            if (update) await update();

            router.replace("/account/vendor");
            router.refresh();
          } catch (err: any) {
            notifyError(err?.message || "Update failed");
          } finally {
            setLoading(false);
          }
        };
  // Progress Calculation
  const progress = (() => {
    let score = 0;
    if (formData.logoUrl && formData.coverUrl) score += 25;
    if (formData.storeName && formData.slug) score += 25; // Slug added to requirement
    if (formData.bankName && formData.accountNumber.length >= 10) score += 25;
    if (formData.instagram || formData.whatsapp) score += 25;
    return score;
  })();

  return (
    <div className="flex flex-col">
      <DashboardHeader title=" Store Settings" showLogout={true} />

      <div className="p-4 md:p-8 space-y-8">
        {/* 1. PROGRESS BANNER */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 bg-[#F7931E]/10 rounded-[1.5rem] flex items-center justify-center text-[#F7931E]">
            <CheckCircle2 size={32} />
          </div>
          <div className="flex-1 w-full">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[12px] font-black text-[#002B5B] uppercase">Setup Completion</span>
              <span className="text-sm font-black text-[#F7931E]">{progress}%</span>
            </div>
            <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#F7931E] transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        {/* 2. BRANDING SECTION (Merged with Slug) */}
        <div className="bg-white rounded-4xl border border-gray-100 shadow-sm overflow-hidden p-8 space-y-6">
          <h3 className="text-2xl font-extrabold text-[#002B5B] uppercase italic">1. Identity & Branding</h3>
          
          {/* Cover/Logo Inputs - Hidden */}
          <input type="file" ref={logoInputRef} onChange={(e) => handleImageUpload(e, "logo")} className="hidden" />
          <input type="file" ref={coverInputRef} onChange={(e) => handleImageUpload(e, "cover")} className="hidden" />

          {/* Cover Photo UI */}
          <div onClick={() => coverInputRef.current?.click()} className="relative h-48 w-full bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer overflow-hidden group">
            {formData.coverUrl ? <img src={formData.coverUrl} className="absolute inset-0 w-full h-full object-cover" /> : <Camera className="text-gray-300" />}
            
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Upload Cover Photo 1000 x 400 pixels</p>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            <div onClick={() => logoInputRef.current?.click()} className="w-32 h-32 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer shrink-0">
               {formData.logoUrl ? <img src={formData.logoUrl} className="rounded-[2rem]" /> : <Store className="text-gray-300" />}
            </div>

            <div className="flex-1 space-y-4">
              <input type="text" placeholder="Store Name" value={formData.storeName} onChange={(e) => setFormData({...formData, storeName: e.target.value})} className="w-full p-4 bg-gray-50 rounded-xl font-bold text-[#002B5B] outline-none" />
              
              {/* SLUG FIELD (The "Unique URL" field from Store-setup) */}
              <div className="relative">
                <input type="text" placeholder="store-unique-url" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} className="w-full p-4 bg-gray-50 rounded-xl font-bold text-[#F7931E] pl-10 outline-none" />
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 uppercase">marvelmarts.com/shop/</span>
              </div>
            </div>
          </div>
          <textarea placeholder="Store Bio/Slogan" value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full p-4 bg-gray-50 rounded-xl font-bold text-[#002B5B] h-24 outline-none" />
        </div>

          {/* 2. PAYOUT DETAILS */}
        <div className="bg-white rounded-4xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-100">
            <h3 className="text-2xl font-extrabold text-[#002B5B] uppercase italic tracking-tighter">2. Payout Details</h3>
          </div>
          <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="h-64 w-full bg-gradient-to-br from-[#002B5B] to-[#05438a] rounded-[3rem] p-10 text-white shadow-2xl flex flex-col justify-between relative overflow-hidden group">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-black uppercase opacity-60 tracking-[0.2em] mb-1">Settlement Account</p>
                  <p className="text-xs font-bold text-[#F7931E]">Active Gateway</p>
                </div>
                <CreditCard className="opacity-20 group-hover:scale-110 transition-transform" size={48} />
              </div>
              <p className="text-2xl md:text-3xl font-mono tracking-[0.25em] font-black">
                {formData.accountNumber ? formData.accountNumber.replace(/(\d{4})/g, '$1 ').trim() : "**** **** ****"}
              </p>
              <div className="flex justify-between items-end">
                <div>
                   <p className="text-[10px] font-black uppercase opacity-60 mb-1 tracking-widest">{formData.bankName || "SELECT BANK"}</p>
                   <p className="text-sm md:text-md font-black uppercase tracking-tight">{formData.accountName || "ACCOUNT HOLDER NAME"}</p>
                </div>
                <ShieldCheck size={24} className="text-green-400 opacity-50" />
              </div>
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full" />
            </div>

            <div className="space-y-4">
              <select 
                value={formData.bankName} 
                onChange={(e) => setFormData({...formData, bankName: e.target.value})} 
                className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-[#002B5B] outline-none border-none appearance-none focus:ring-2 ring-[#F7931E]/20 transition-all cursor-pointer"
              >
                <option value="">Choose Settlement Bank</option>
                <option value="Access Bank">Access Bank</option>
                <option value="GTBank">GTBank</option>
                <option value="Zenith Bank">Zenith Bank</option>
                <option value="First Bank">First Bank</option>
                <option value="UBA">UBA</option>
                <option value="Kuda Bank">Kuda Bank</option>
                <option value="OPay">OPay</option>
                <option value="Moniepoint">Moniepoint</option>
              </select>
              <input 
                type="text" 
                placeholder="10-Digit Account Number" 
                maxLength={10} 
                value={formData.accountNumber} 
                onChange={(e) => setFormData({...formData, accountNumber: e.target.value.replace(/\D/g, '')})} 
                className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-[#002B5B] outline-none focus:ring-2 ring-[#F7931E]/20 transition-all" 
              />
              <input 
                type="text" 
                placeholder="Account Name" 
                value={formData.accountName} 
                onChange={(e) => setFormData({...formData, accountName: e.target.value})} 
                className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-[#002B5B] outline-none focus:ring-2 ring-[#F7931E]/20 transition-all" 
              />
            </div>
          </div>
        </div>

        {/* 3. SOCIALS */}
        <div className="bg-white rounded-4xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-100">
            <h3 className="text-2xl font-extrabold text-[#002B5B] uppercase italic tracking-tighter">3. Social Connections</h3>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {['instagram', 'whatsapp', 'facebook'].map((platform) => (
              <div key={platform} className="relative group">
                <input 
                  type="text" 
                  placeholder={`Your ${platform} handle`} 
                  value={(formData as any)[platform]}
                  onChange={(e) => setFormData({...formData, [platform]: e.target.value})}
                  className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-[#002B5B] pr-12 outline-none border-2 border-transparent focus:border-[#F7931E]/30 transition-all" 
                />
                <Globe className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#F7931E] transition-colors" size={18} />
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleSave} disabled={loading} className="w-full py-6 bg-[#002B5B] text-white rounded-[2rem] font-black uppercase tracking-widest hover:bg-[#F7931E] transition-all flex items-center justify-center gap-3">
          {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
          Save All Changes
        </button>
      </div>
    </div>
  );
}



