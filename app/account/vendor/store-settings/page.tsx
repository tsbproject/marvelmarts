"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import confetti from "canvas-confetti";
import DashboardHeader from "@/app/_components/DashboardHeader";
import { Camera, Store, Image as ImageIcon, CheckCircle2, Loader2 } from "lucide-react";
import { useNotification } from "@/app/_context/NotificationContext";

export default function VendorProfilePage() {
  const { data: session, update } = useSession();
  const { notifySuccess, notifyError } = useNotification();
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<"logo" | "cover" | null>(null);

  const [hasCelebrated, setHasCelebrated] = useState(false);

  // State for branding fields
  const [formData, setFormData] = useState({
    logoUrl: "",
    coverUrl: "",
    bio: "",
    storeName: session?.user?.name || ""
  });

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

 const validateImage = (file: File, type: "logo" | "cover", notifyError: (msg: string) => void) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  const maxLogoSize = 2 * 1024 * 1024; // 2MB
  const maxCoverSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    notifyError("Invalid file type. Please upload JPG, PNG, or WebP.");
    return false;
  }

  const currentMaxSize = type === "logo" ? maxLogoSize : maxCoverSize;
  if (file.size > currentMaxSize) {
    notifyError(`File too large. ${type === "logo" ? "Logo max 2MB" : "Cover max 5MB"}.`);
    return false;
  }

  return true;
};
  // Cloudinary Upload Handler
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "cover") => {
    const file = e.target.files?.[0];;
      
      // Security & Size Validation
     if (!file || !validateImage(file, type, notifyError)) return;

      setUploading(type);
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "marvel_marts_preset"); 

      // Optional: Cloudinary Folder Organization
      data.append("folder", `vendors/${session?.user?.id}/branding`);

      try {
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: data,
          }
        );
        
        const fileData = await res.json();
        
        if (fileData.secure_url) {
          setFormData(prev => ({
            ...prev,
            [type === "logo" ? "logoUrl" : "coverUrl"]: fileData.secure_url
          }));
          notifySuccess(`${type === "logo" ? "Store Logo" : "Cover Photo"} uploaded!`);
        } else {
          throw new Error("Upload response invalid");
        }
      } catch (err) {
        notifyError("Upload failed. Check your connection or Cloudinary preset.");
      } finally {
        setUploading(null);
        // Reset the input so the user can re-upload the same file if they want
        e.target.value = "";
      }
    };
  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/vendors/profile/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        notifySuccess("Store branding updated and saved!");
        // Update session if store name changed
        update(); 
      } else {
        notifyError("Failed to save changes");
      }
    } catch (err) {
      notifyError("Server error");
    } finally {
      setLoading(false);
    }
  };

  // Calculate progress (out of 100)
    const calculateProgress = () => {
      let steps = 0;
      if (formData.logoUrl) steps += 33.3;
      if (formData.coverUrl) steps += 33.3;
      if (formData.bio.length > 10) steps += 33.4;
      return Math.round(steps);
    };

    const progress = calculateProgress();

    useEffect(() => {
  if (progress === 100 && !hasCelebrated) {
    // Fire the celebration!
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      // Since they are finishing their shop, let's use MarvelMarts colors!
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#F7931E', '#002B5B', '#ffffff']
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#F7931E', '#002B5B', '#ffffff']
      });
    }, 250);

    setHasCelebrated(true);
    notifySuccess("Amazing! Your store branding is complete! 🚀");
  }
  
        // Reset celebration if they delete something (optional)
        if (progress < 100 && hasCelebrated) {
          setHasCelebrated(false);
        }
      }, [progress, hasCelebrated]);

          

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader title="Store Settings" showLogout={true} />

    

{/* VENDOR-ONLY PROGRESS SECTION */}
<div className="px-4 md:px-8 mt-6">
  <div className="bg-white p-5 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-4">
    <div className="w-12 h-12 bg-[#F7931E]/10 rounded-2xl flex items-center justify-center text-[#F7931E]">
      <CheckCircle2 size={24} />
    </div>
    
    <div className="flex-1 w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] font-black text-accent-navy uppercase tracking-widest">
          Store Setup Progress
        </span>
        <span className="text-sm font-black text-[#F7931E]">{progress}%</span>
      </div>
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-[#F7931E] transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>

    {progress === 100 && (
      <div className="bg-green-50 px-4 py-2 rounded-xl border border-green-100 animate-bounce">
        <p className="text-[10px] font-black text-green-700 uppercase">Ready to Launch! 🚀</p>
      </div>
    )}
  </div>
</div>

      <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
        
        <div className="bg-white rounded-4xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-100">
            <h3 className="text-2xl font-accent-navy font-extrabold text-[#002B5B] uppercase tracking-tight">Store Branding</h3>
            <p className="text-gray-500 text-xl font-medium">Customize how your store appears to customers.</p>
          </div>

          <div className="p-8 space-y-10">
            {/* Hidden Inputs */}
            <input type="file" ref={logoInputRef} onChange={(e) => handleImageUpload(e, "logo")} className="hidden" accept="image/*" />
            <input type="file" ref={coverInputRef} onChange={(e) => handleImageUpload(e, "cover")} className="hidden" accept="image/*" />

            {/* Cover Photo Upload */}
            <div className="space-y-4">
              <label className="text-lg font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <ImageIcon size={14} className="text-[#F7931E]" /> Store Cover Photo
              </label>
              <div 
                onClick={() => coverInputRef.current?.click()}
                className="relative h-48 w-full bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center group cursor-pointer hover:bg-orange-50/30 hover:border-[#F7931E]/50 transition-all overflow-hidden"
              >
                {formData.coverUrl ? (
                  <img src={formData.coverUrl} className="absolute inset-0 w-full h-full object-cover" alt="Cover" />
                ) : (
                  <>
                    {uploading === "cover" ? <Loader2 className="animate-spin text-[#F7931E]" /> : <Camera className="text-gray-400 group-hover:text-[#F7931E] mb-2" size={32} />}
                    <p className="text-lg font-bold text-gray-400">Click to upload cover image, recommended size 1200 x 400 pixel</p>
                  </>
                )}
              </div>
            </div>

      
            {/* Logo and Business Info */}
            <div className="space-y-4">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Store size={14} className="text-[#F7931E]" /> Store Logo (1:1 Recommended)
              </label>
              
              <div 
                onClick={() => logoInputRef.current?.click()}
                className="relative w-36 h-36 bg-gray-50 rounded-4xl border-2 border-dashed border-gray-200 flex items-center justify-center group cursor-pointer hover:border-[#F7931E]/50 transition-all duration-300 overflow-hidden shadow-inner"
              >
                {formData.logoUrl ? (
                  <>
                    <img src={formData.logoUrl} className="w-full h-full object-cover" alt="Logo" />
                    
                    {/* IMPROVED CIRCULAR PREVIEW OVERLAY */}
                    <div className="absolute inset-0 bg-[#002B5B]/80 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center p-3 text-center">
                      <div className="w-20 h-20 rounded-full border-2 border-[#F7931E] overflow-hidden mb-2 shadow-2xl scale-90 group-hover:scale-100 transition-transform duration-500">
                        <img src={formData.logoUrl} className="w-full h-full object-cover" alt="Circular view" />
                      </div>
                      <p className="text-[10px] text-white font-black uppercase tracking-tighter leading-tight">
                        Circle <br/> Preview
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    {uploading === "logo" ? (
                      <Loader2 className="animate-spin text-[#F7931E]" size={32} />
                    ) : (
                      <>
                        <Store className="text-gray-300 group-hover:text-[#F7931E] transition-colors" size={40} />
                        <span className="text-[10px] font-bold text-gray-400">Upload Logo</span>
                      </>
                    )}
                  </div>
                )}

                {/* Camera Icon Badge */}
                <div className="absolute bottom-2 right-2 bg-[#F7931E] p-2 rounded-xl text-white shadow-lg z-10 group-hover:scale-110 transition-transform">
                  <Camera size={16} />
                </div>
              </div>
</div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xl font-black text-gray-400 uppercase tracking-widest">Business Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter you business name "
                    value={formData.storeName}
                    onChange={(e) => setFormData({...formData, storeName: e.target.value})}
                    className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:border-[#F7931E] focus:bg-white outline-none font-bold text-[#002B5B] transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xl font-black text-gray-400 uppercase tracking-widest">Store Bio / Slogan</label>
                  <input 
                    type="text" 
                    placeholder="Short description of your store..."
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    className="w-full p-4 bg-gray-50 rounded-2xl border border-transparent focus:border-[#F7931E] focus:bg-white outline-none font-bold text-[#002B5B] transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 bg-gray-50/50 flex justify-end">
            <button 
              disabled={loading || uploading !== null}
              onClick={handleSave}
              className={`px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 disabled:opacity-50 shadow-xl ${
                progress === 100 
                  ? "bg-green-600 text-white hover:bg-green-700 animate-pulse" 
                  : "bg-[#002B5B] text-white hover:bg-opacity-90"
              }`}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : progress === 100 ? (
                <>🚀 Complete Setup & Launch</>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  Save Branding Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
  
  );
}