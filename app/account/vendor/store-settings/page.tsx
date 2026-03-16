



// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useSession } from "next-auth/react";
// import { useDispatch, useSelector } from "react-redux";
// import { AppDispatch, RootState } from "@/store";
// import { updateVendorSettings } from "@/store/vendorSlice";
// import confetti from "canvas-confetti";
// import DashboardHeader from "@/app/_components/DashboardHeader";
// import { Camera, Store, CheckCircle2, Loader2, CreditCard, Globe, ArrowUpRight, ShieldCheck } from "lucide-react";
// import { useNotification } from "@/app/_context/NotificationContext";

// const validateImage = (file: File, type: "logo" | "cover", notifyError: (msg: string) => void) => {
//   const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
//   const maxLogoSize = 2 * 1024 * 1024;
//   const maxCoverSize = 5 * 1024 * 1024;

//   if (!allowedTypes.includes(file.type)) {
//     notifyError("Invalid file type. Please upload JPG, PNG, or WebP.");
//     return false;
//   }
//   const currentMaxSize = type === "logo" ? maxLogoSize : maxCoverSize;
//   if (file.size > currentMaxSize) {
//     notifyError(`File too large. ${type === "logo" ? "Logo max 2MB" : "Cover max 5MB"}.`);
//     return false;
//   }
//   return true;
// };

// export default function VendorProfilePage() {
//   const { data: session, update } = useSession();
//   const { notifySuccess, notifyError } = useNotification();
//   const dispatch = useDispatch<AppDispatch>();

//   const vendorProfile = useSelector((state: RootState) => state.vendor.profile);

//   const [loading, setLoading] = useState(false);
//   const [uploading, setUploading] = useState<"logo" | "cover" | null>(null);
//   const [hasCelebrated, setHasCelebrated] = useState(false);

//   const [formData, setFormData] = useState({
//     logoUrl: "",
//     coverUrl: "",
//     bio: "", 
//     storeName: "",
//     instagram: "",
//     whatsapp: "",
//     twitter: "",
//     facebook: "", 
//     bankName: "",
//     accountNumber: "",
//     accountName: "",
//   });

//   useEffect(() => {
//     if (vendorProfile) {
//       setFormData(prev => ({
//         ...prev,
//         logoUrl: vendorProfile.logoUrl ?? prev.logoUrl,
//         coverUrl: vendorProfile.coverUrl ?? prev.coverUrl,
//         bio: vendorProfile.bio ?? prev.bio, 
//         storeName: vendorProfile.storeName ?? session?.user?.name ?? prev.storeName,
//         instagram: vendorProfile.instagram ?? prev.instagram,
//         whatsapp: vendorProfile.whatsapp ?? prev.whatsapp,
//         twitter: vendorProfile.twitter ?? prev.twitter,
//         facebook: vendorProfile.facebook ?? prev.facebook,
//         bankName: vendorProfile.bankName ?? prev.bankName,
//         accountNumber: vendorProfile.accountNumber ?? prev.accountNumber,
//         accountName: vendorProfile.accountName ?? prev.accountName,
//       }));
//     }
//   }, [vendorProfile, session]);

//   const logoInputRef = useRef<HTMLInputElement>(null);
//   const coverInputRef = useRef<HTMLInputElement>(null);

//   const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "cover") => {
//     const file = e.target.files?.[0];
//     if (!file || !validateImage(file, type, notifyError)) return;

//     setUploading(type);
//     const data = new FormData();
//     data.append("file", file);
//     data.append("upload_preset", "marvelmartsupload"); 
//     data.append("folder", `vendors/${session?.user?.id}/branding`);

//     try {
//       const res = await fetch(
//         `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
//         { method: "POST", body: data }
//       );
//       const fileData = await res.json();
//       if (fileData.secure_url) {
//         setFormData(prev => ({ ...prev, [type === "logo" ? "logoUrl" : "coverUrl"]: fileData.secure_url }));
//         notifySuccess(`${type === "logo" ? "Store Logo" : "Cover Photo"} uploaded!`);
//       }
//     } catch (err) {
//       notifyError("Upload failed.");
//     } finally {
//       setUploading(null);
//     }
//   };

//   const handleSave = async () => {
//   setLoading(true);
//   try {
//     // 1. Calculate completion states based on your form fields
//     const isBrandingComplete = !!(
//       formData.logoUrl && 
//       formData.coverUrl && 
//       formData.storeName
//     );

//     const isPayoutComplete = !!(
//       formData.bankName && 
//       formData.accountNumber && 
//       formData.accountNumber.length >= 10 && 
//       formData.accountName
//     );

//     // 2. Prepare the object to send to the backend
//     const sanitizedData = {
//       storeName: formData.storeName || undefined,
//       bio: formData.bio || undefined,
//       logoUrl: formData.logoUrl || undefined,
//       coverUrl: formData.coverUrl || undefined,
//       bankName: formData.bankName || undefined,
//       accountNumber: formData.accountNumber || undefined,
//       accountName: formData.accountName || undefined,
//       instagram: formData.instagram || undefined,
//       whatsapp: formData.whatsapp || undefined,
//       twitter: formData.twitter || undefined,
//       facebook: formData.facebook || undefined,
      
//       // 3. Include the completion flags
//       // Ensure these field names match your Prisma schema/backend expectations
//       storeDone: isBrandingComplete,
//       payoutsDone: isPayoutComplete, 
//     };

//     // 4. Update the store in Redux/Database
//     await dispatch(updateVendorSettings(sanitizedData)).unwrap();
    
//     // 5. Success feedback
//     notifySuccess("Store profile successfully saved!");

//     // 6. Update the session so the store name reflects immediately in the UI
//     if (update) {
//       await update({
//         ...session,
//         user: { ...session?.user, name: formData.storeName },
//       });
//     }
//   } catch (err: any) {
//     // 7. Error handling using your context function
//     notifyError(err?.message || "Failed to save changes. Please try again.");
//   } finally {
//     setLoading(false);
//   }
// };
//   const progress = (() => {
//     let score = 0;
//     if (formData.logoUrl && formData.coverUrl) score += 25;
//     if (formData.bio && formData.storeName) score += 25;
//     if (formData.bankName && formData.accountNumber.length >= 10) score += 25;
//     if (formData.instagram || formData.whatsapp) score += 25;
//     return score;
//   })();

//   useEffect(() => {
//     if (progress === 100 && !hasCelebrated) {
//       confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#F7931E', '#002B5B', '#ffffff'] });
//       setHasCelebrated(true);
//       notifySuccess("Store setup complete! 🚀");
//     }
//   }, [progress, hasCelebrated]);

//   return (
//     <div className="flex flex-col min-h-screen bg-gray-50/30">
//       <DashboardHeader title="Store Settings" showLogout={true} />

//       {/* SETUP PROGRESS HEADER */}
//       <div className="px-4 md:px-8 mt-6">
//         <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-6">
//           <div className="w-16 h-16 bg-[#F7931E]/10 rounded-[1.5rem] flex items-center justify-center text-[#F7931E] shrink-0">
//             <CheckCircle2 size={32} />
//           </div>
//           <div className="flex-1 w-full">
//             <div className="flex justify-between items-center mb-2">
//               <span className="text-[12px] font-black text-[#002B5B] uppercase tracking-widest">Store Setup Status</span>
//               <span className="text-sm font-black text-[#F7931E]">{progress}%</span>
//             </div>
//             <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
//               <div className="h-full bg-[#F7931E] transition-all duration-700" style={{ width: `${progress}%` }} />
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="p-4 md:p-8 space-y-10">
        
//         {/* 1. BRANDING */}
//         <div className="bg-white rounded-4xl border border-gray-100 shadow-sm overflow-hidden">
//           <div className="p-8 border-b border-gray-100">
//             <h3 className="text-2xl font-extrabold text-[#002B5B] uppercase italic tracking-tighter">1. Store Branding</h3>
//           </div>
//           <div className="p-8 space-y-10">
//             <input type="file" ref={logoInputRef} onChange={(e) => handleImageUpload(e, "logo")} className="hidden" />
//             <input type="file" ref={coverInputRef} onChange={(e) => handleImageUpload(e, "cover")} className="hidden" />

//             <div 
//               onClick={() => coverInputRef.current?.click()}
//               className="relative h-56 w-full bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer overflow-hidden group hover:border-[#F7931E] transition-colors"
//             >
//               {formData.coverUrl ? (
//                 <>
//                   <img src={formData.coverUrl} className="absolute inset-0 w-full h-full object-cover" alt="Cover" />
//                   <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
//                     <Camera className="text-white" size={32} />
//                   </div>
//                 </>
//               ) : (
//                 <div className="text-center">
//                   {uploading === "cover" ? <Loader2 className="animate-spin text-[#002B5B] mx-auto" /> : (
//                     <>
//                       <Camera className="text-gray-300 mx-auto mb-2" size={32} />
//                       <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Upload Cover Photo</p>
//                     </>
//                   )}
//                 </div>
//               )}
//             </div>

//             <div className="flex flex-col md:flex-row gap-10">
//               <div onClick={() => logoInputRef.current?.click()} className="relative w-40 h-40 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer overflow-hidden shrink-0 group hover:border-[#F7931E] transition-colors">
//                 {formData.logoUrl ? (
//                   <>
//                     <img src={formData.logoUrl} className="w-full h-full object-cover" alt="Logo" />
//                     <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
//                       <Camera className="text-white" size={24} />
//                     </div>
//                   </>
//                 ) : (
//                   uploading === "logo" ? <Loader2 className="animate-spin text-[#002B5B]" /> : <Store className="text-gray-300" size={40} />
//                 )}
//               </div>

//               <div className="flex-1 space-y-6">
//                 <div className="relative">
//                    <input type="text" placeholder="Store Name" value={formData.storeName} onChange={(e) => setFormData({...formData, storeName: e.target.value})} className="w-full p-5 bg-gray-50 rounded-2xl border-none outline-none font-bold text-[#002B5B] uppercase text-sm focus:ring-2 ring-[#F7931E]/20 transition-all" />
//                    <Store className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
//                 </div>
//                 <div className="relative">
//                   <input type="text" placeholder="Store Bio / Slogan" value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full p-5 bg-gray-50 rounded-2xl border-none outline-none font-bold text-[#002B5B] text-sm focus:ring-2 ring-[#F7931E]/20 transition-all" />
//                   <Globe className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

        // {/* 2. PAYOUT DETAILS */}
        // <div className="bg-white rounded-4xl border border-gray-100 shadow-sm overflow-hidden">
        //   <div className="p-8 border-b border-gray-100">
        //     <h3 className="text-2xl font-extrabold text-[#002B5B] uppercase italic tracking-tighter">2. Payout Details</h3>
        //   </div>
        //   <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
        //     <div className="h-64 w-full bg-gradient-to-br from-[#002B5B] to-[#05438a] rounded-[3rem] p-10 text-white shadow-2xl flex flex-col justify-between relative overflow-hidden group">
        //       <div className="flex justify-between items-start">
        //         <div>
        //           <p className="text-[10px] font-black uppercase opacity-60 tracking-[0.2em] mb-1">Settlement Account</p>
        //           <p className="text-xs font-bold text-[#F7931E]">Active Gateway</p>
        //         </div>
        //         <CreditCard className="opacity-20 group-hover:scale-110 transition-transform" size={48} />
        //       </div>
        //       <p className="text-2xl md:text-3xl font-mono tracking-[0.25em] font-black">
        //         {formData.accountNumber ? formData.accountNumber.replace(/(\d{4})/g, '$1 ').trim() : "**** **** ****"}
        //       </p>
        //       <div className="flex justify-between items-end">
        //         <div>
        //            <p className="text-[10px] font-black uppercase opacity-60 mb-1 tracking-widest">{formData.bankName || "SELECT BANK"}</p>
        //            <p className="text-sm md:text-md font-black uppercase tracking-tight">{formData.accountName || "ACCOUNT HOLDER NAME"}</p>
        //         </div>
        //         <ShieldCheck size={24} className="text-green-400 opacity-50" />
        //       </div>
        //       <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full" />
        //     </div>

        //     <div className="space-y-4">
        //       <select 
        //         value={formData.bankName} 
        //         onChange={(e) => setFormData({...formData, bankName: e.target.value})} 
        //         className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-[#002B5B] outline-none border-none appearance-none focus:ring-2 ring-[#F7931E]/20 transition-all cursor-pointer"
        //       >
        //         <option value="">Choose Settlement Bank</option>
        //         <option value="Access Bank">Access Bank</option>
        //         <option value="GTBank">GTBank</option>
        //         <option value="Zenith Bank">Zenith Bank</option>
        //         <option value="First Bank">First Bank</option>
        //         <option value="UBA">UBA</option>
        //         <option value="Kuda Bank">Kuda Bank</option>
        //         <option value="OPay">OPay</option>
        //         <option value="Moniepoint">Moniepoint</option>
        //       </select>
        //       <input 
        //         type="text" 
        //         placeholder="10-Digit Account Number" 
        //         maxLength={10} 
        //         value={formData.accountNumber} 
        //         onChange={(e) => setFormData({...formData, accountNumber: e.target.value.replace(/\D/g, '')})} 
        //         className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-[#002B5B] outline-none focus:ring-2 ring-[#F7931E]/20 transition-all" 
        //       />
        //       <input 
        //         type="text" 
        //         placeholder="Account Name" 
        //         value={formData.accountName} 
        //         onChange={(e) => setFormData({...formData, accountName: e.target.value})} 
        //         className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-[#002B5B] outline-none focus:ring-2 ring-[#F7931E]/20 transition-all" 
        //       />
        //     </div>
        //   </div>
        // </div>

        // {/* 3. SOCIALS */}
        // <div className="bg-white rounded-4xl border border-gray-100 shadow-sm overflow-hidden">
        //   <div className="p-8 border-b border-gray-100">
        //     <h3 className="text-2xl font-extrabold text-[#002B5B] uppercase italic tracking-tighter">3. Social Connections</h3>
        //   </div>
        //   <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        //     {['instagram', 'whatsapp', 'facebook'].map((platform) => (
        //       <div key={platform} className="relative group">
        //         <input 
        //           type="text" 
        //           placeholder={`Your ${platform} handle`} 
        //           value={(formData as any)[platform]}
        //           onChange={(e) => setFormData({...formData, [platform]: e.target.value})}
        //           className="w-full p-5 bg-gray-50 rounded-2xl font-bold text-[#002B5B] pr-12 outline-none border-2 border-transparent focus:border-[#F7931E]/30 transition-all" 
        //         />
        //         <Globe className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#F7931E] transition-colors" size={18} />
        //       </div>
        //     ))}
        //   </div>
        // </div>

//         {/* SAVE BUTTON */}
//         <div className="flex justify-end pb-20">
//           <button 
//             disabled={loading || uploading !== null}
//             onClick={handleSave}
//             className={`px-16 py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl flex items-center gap-4 ${
//               progress === 100 
//               ? "bg-green-600 text-white shadow-green-600/30 hover:scale-105" 
//               : "bg-[#002B5B] text-white shadow-blue-900/30 hover:scale-105"
//             } disabled:opacity-50`}
//           >
//             {loading ? <Loader2 className="animate-spin" size={20} /> : (
//                 <>
//                     <CheckCircle2 size={20} />
//                     Confirm & Save Profile
//                 </>
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }



import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import StoreSettingsForm from "./StoreSettingForm";

export default async function VendorSettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) redirect("/auth/sign-in");
  if (session.user.vendorStatus === "REJECTED") redirect("/account/vendor");

  const vendor = await prisma.vendorProfile.findUnique({
    where: { userId: session.user.id },
    include: { store: true }
  });

  if (!vendor) redirect("/account/vendor");

  // FIX: Create a serialized version of the vendor object
  const serializedVendor = {
    ...vendor,
    // Convert Decimal to number
    balance: vendor.balance ? Number(vendor.balance) : 0,
    // Ensure dates are strings or timestamps
    createdAt: vendor.createdAt.toISOString(),
    updatedAt: vendor.updatedAt.toISOString(),
    // Handle other potentially problematic fields
  };

  return (
    <StoreSettingsForm 
      // Pass the serialized object instead of the raw prisma result
      vendor={serializedVendor} 
      initialStoreData={serializedVendor.store} 
    />
  );
}
