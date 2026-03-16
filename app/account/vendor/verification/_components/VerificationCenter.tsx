



// "use client";

// import { useState, useRef, Suspense, useMemo } from "react";
// import { useSession } from "next-auth/react";

// import { 
//   ShieldCheck, FileText, MapPin, 
//   Clock, CheckCircle, AlertCircle, ChevronRight, Briefcase, Loader2 
// } from "lucide-react";
// import { useNotification } from "@/app/_context/NotificationContext";
// import { submitVendorDocs } from "@/app/_actions/admin-actions";
// import { getCloudinarySignature } from "@/app/_actions/upload-actions";
// import { useRouter } from "next/navigation";

// type VerificationStatus = "NOT_STARTED" | "PENDING" | "APPROVED" | "REJECTED" | "PENDING_REVIEW";

// interface VendorProfileData {
//   identityDoc?: string | null;
//   businessDoc?: string | null;
//   locationDoc?: string | null;
// }

// interface Props {
//   vendorProfileId: string;
//   currentStatus: VerificationStatus;
//   profileData?: VendorProfileData; 
// }

// function VerificationCenterContent({ vendorProfileId, currentStatus, profileData }: Props) {
//   const { notifySuccess, notifyError } = useNotification();
//   const router = useRouter();
//   const fileInputRef = useRef<HTMLInputElement>(null);
  
//   const [loading, setLoading] = useState<string | null>(null);
//   const [activeStep, setActiveStep] = useState<string | null>(null);
//   const [isRedirecting, setIsRedirecting] = useState(false);
//   const { update } = useSession();


//   // useMemo to prevent re-calculation on every render and fix key issues
//   const steps = useMemo(() => [
//     { 
//       id: "IDENTITY", 
//       title: "Identity Verification", 
//       desc: "Upload Passport or Driver's License", 
//       icon: <FileText className={currentStatus === "REJECTED" && !profileData?.identityDoc ? "text-red-500" : "text-blue-500"} />,
//       isDone: !!profileData?.identityDoc,
//       isRejected: currentStatus === "REJECTED" && !profileData?.identityDoc 
//     },
//     { 
//       id: "BUSINESS", 
//       title: "Business Registration", 
//       desc: "Upload CAC or Certificate of Incorporation", 
//       icon: <Briefcase className={currentStatus === "REJECTED" && !profileData?.businessDoc ? "text-red-500" : "text-orange-500"} />,
//       isDone: !!profileData?.businessDoc,
//       isRejected: currentStatus === "REJECTED" && !profileData?.businessDoc
//     },
//     { 
//       id: "LOCATION", 
//       title: "Business Location", 
//       desc: "Upload Utility Bill or Tenancy Agreement", 
//       icon: <MapPin className={currentStatus === "REJECTED" && !profileData?.locationDoc ? "text-red-500" : "text-green-500"} />,
//       isDone: !!profileData?.locationDoc,
//       isRejected: currentStatus === "REJECTED" && !profileData?.locationDoc
//     }
//   ], [profileData, currentStatus]);

//   const triggerUpload = (stepId: string) => {
//     if (loading || isRedirecting) return;
//     setActiveStep(stepId);
//     fileInputRef.current?.click();
//   };

//   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//   const file = e.target.files?.[0];
//   if (!file || !activeStep || !vendorProfileId) return;

//   if (file.size > 5 * 1024 * 1024) {
//     notifyError("File too large (max 5MB)");
//     return;
//   }

//   setLoading(activeStep);

//   try {
//     const sigResult = await getCloudinarySignature("vendor-docs") as any;
//     if (!sigResult?.success) throw new Error("Signature failed");

//     const formData = new FormData();
//     formData.append("file", file);
//     formData.append("api_key", sigResult.apiKey);
//     formData.append("timestamp", sigResult.timestamp.toString());
//     formData.append("signature", sigResult.signature);
//     formData.append("folder", "vendor-docs");

//     const uploadRes = await fetch(
//       `https://api.cloudinary.com/v1_1/${sigResult.cloudName}/image/upload`,
//       { method: "POST", body: formData }
//     );
//     const uploadData = await uploadRes.json();

//     const dbResult = await submitVendorDocs(vendorProfileId, uploadData.secure_url, activeStep);

//     if (dbResult?.success) {
//       notifySuccess("Upload successful!");

//       if (dbResult?.allDocsSubmitted || dbResult?.status === "PENDING_REVIEW") {
//         setIsRedirecting(true);

//         setTimeout(async () => {
//           try {
//             await update(); // refresh NextAuth session
//           } catch (err) {
//             console.error("Session update failed:", err);
//           }
//           router.push("/account/vendor/verification"); 
        
//         }, 1500);

//       } else {
//         router.refresh();
//       }
//     }
//   } catch (error: any) {
//     notifyError(error.message || "Upload failed");
//   } finally {
//     setLoading(null);
//     setActiveStep(null);
//     if (fileInputRef.current) fileInputRef.current.value = "";
//   }
// };


//   return (
//     <div className="relative">
//       {/* Success Redirect Overlay */}
//       {isRedirecting && (
//         <div className="fixed inset-0 z-[100] bg-accent-navy/95 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-500">
//           <div className="w-24 h-24 bg-brand-primary rounded-full flex items-center justify-center mb-6 animate-bounce">
//             <ShieldCheck size={48} className="text-accent-navy" />
//           </div>
//           <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-2">Documents Secured!</h2>
//           <p className="text-blue-100 font-bold max-w-xs uppercase text-xs tracking-[0.2em]">Initiating compliance review protocol...</p>
//           <Loader2 className="mt-8 text-brand-primary animate-spin" size={32} />
//         </div>
//       )}

//       <div className={`max-w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ${isRedirecting ? 'opacity-0 scale-95 transition-all duration-500' : 'opacity-100'}`}>
//         <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,.pdf" />

//         {/* Hero Header */}
//         <div className="bg-gradient-to-br from-accent-navy via-[#003366] to-accent-navy rounded-[32px] p-10 text-white shadow-2xl relative overflow-hidden border border-white/10">
//           <div className="relative z-10">
//             <span className="bg-brand-primary/20 text-brand-primary text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-4 inline-block border border-brand-primary/30">Phase 3: Verification</span>
//             <h1 className="text-4xl font-black uppercase tracking-tighter mb-2 italic">Trust & Verification</h1>
//             <p className="text-blue-100/80 max-w-md text-sm font-medium leading-relaxed">
//               Submit credentials to join our elite marketplace and unlock your <span className="text-brand-primary font-bold ml-1 italic underline decoration-2 underline-offset-4">Verified Merchant Badge</span>.
//             </p>
//           </div>
//           <ShieldCheck size={180} className="absolute right-[-30px] top-[-30px] text-white/5 rotate-12 pointer-events-none" />
//         </div>

//         {/* Checklist Steps */}
//         <div className="grid gap-5">
//           {steps.map((step) => (
//             <div 
//               key={step.id} 
//               className={`bg-white border rounded-[2.5rem] p-7 flex flex-col md:flex-row items-start md:items-center justify-between transition-all duration-500 gap-6 group ${
//                 step.isRejected ? "border-red-200 bg-red-50/30 shadow-inner" : "border-gray-100 hover:shadow-xl hover:border-brand-primary/10"
//               }`}
//             >
//               <div className="flex items-center gap-6">
//                 <div className="w-20 h-20 rounded-[2rem] bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100 group-hover:bg-white group-hover:scale-110 transition-transform duration-500">
//                   {step.isDone ? <CheckCircle className="text-green-500" size={32} /> : step.icon}
//                 </div>
//                 <div>
//                   <h3 className={`text-xl font-black uppercase italic ${step.isRejected ? "text-red-600" : "text-accent-navy"}`}>
//                     {step.title} {step.isRejected && " (Action Required)"}
//                   </h3>
//                   <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{step.desc}</p>
//                 </div>
//               </div>

//               <div className="flex items-center gap-5 w-full md:w-auto justify-between md:justify-end">
//                 <StatusBadge status={step.isDone ? "PENDING" : (step.isRejected ? "REJECTED" : currentStatus)} />
                
//                 {currentStatus !== "APPROVED" && (
//                   <button 
//                     onClick={() => triggerUpload(step.id)}
//                     disabled={!!loading || step.isDone || isRedirecting}
//                     className={`relative flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-[0.15em] transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${
//                       step.isDone 
//                         ? "bg-green-100 text-green-600 shadow-none cursor-default" 
//                         : step.isRejected 
//                         ? "bg-red-600 text-white hover:bg-red-700" 
//                         : "bg-accent-navy text-white hover:bg-brand-primary hover:text-accent-navy"
//                     }`}
//                   >
//                     {loading === step.id ? (
//                       <span className="flex items-center gap-2">
//                         <Loader2 size={18} className="animate-spin" />
//                         Uploading...
//                       </span>
//                     ) : step.isDone ? (
//                       <span className="flex items-center gap-2"><CheckCircle size={18} />Uploaded</span>
//                     ) : (
//                       <>
//                         {step.isRejected ? "Re-upload Now" : "Upload Now"}
//                         <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
//                       </>
//                     )}
//                   </button>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Footer */}
//         <div className="bg-orange-50 border border-orange-100 rounded-[2rem] p-8 flex gap-5 items-center shadow-inner">
//           <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
//             <AlertCircle className="text-orange-600" size={24} />
//           </div>
//           <div>
//             <h4 className="font-black text-orange-900 uppercase text-xs tracking-[0.2em] mb-1">Internal Review Protocol</h4>
//             <p className="text-orange-700/80 text-sm font-bold italic leading-tight">
//               Our compliance team reviews documents within 24-48 business hours. You will receive a notification once your status updates.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // Sub-components kept identical for style continuity
// export default function VerificationCenter(props: Props) {
//   return (
//     <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-brand-primary" /></div>}>
//       <VerificationCenterContent {...props} />
//     </Suspense>
//   );
// }

// function StatusBadge({ status }: { status: string }) {
//   const safeStatus = status || "NOT_STARTED";
//   const styles: any = {
//     NOT_STARTED: "bg-gray-100 text-gray-400 border-transparent",
//     PENDING: "bg-blue-50 text-blue-600 border-blue-100 shadow-sm shadow-blue-100",
//     APPROVED: "bg-green-50 text-green-600 border-green-100 shadow-sm shadow-green-100",
//     REJECTED: "bg-red-50 text-red-600 border-red-100 shadow-sm shadow-red-100",
//     PENDING_REVIEW: "bg-blue-50 text-blue-600 border-blue-100 shadow-sm shadow-blue-100",
//   };
//   return (
//     <div className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shrink-0 border-2 ${styles[safeStatus]}`}>
//       {safeStatus.replace("_", " ")}
//     </div>
//   );
// }





"use client";

import { useState, useRef, Suspense, useMemo } from "react";
import { useSession } from "next-auth/react";
import { 
  ShieldCheck, FileText, MapPin, 
  CheckCircle, AlertCircle, ChevronRight, Briefcase, Loader2 
} from "lucide-react";
import { useNotification } from "@/app/_context/NotificationContext";
import { submitVendorDocs } from "@/app/_actions/admin-actions";
import { getCloudinarySignature } from "@/app/_actions/upload-actions";
import { useRouter } from "next/navigation";

type VerificationStatus = "NOT_STARTED" | "PENDING" | "APPROVED" | "REJECTED" | "PENDING_REVIEW";

interface VendorProfileData {
  identityDoc?: string | null;
  businessDoc?: string | null;
  locationDoc?: string | null;
}

interface Props {
  vendorProfileId: string;
  currentStatus: VerificationStatus;
  profileData?: VendorProfileData; 
}

function VerificationCenterContent({ vendorProfileId, currentStatus, profileData }: Props) {
  const { notifySuccess, notifyError } = useNotification();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { update } = useSession();

  // Steps definition with memoization
  const steps = useMemo(() => [
    { 
      id: "IDENTITY", 
      title: "Identity Verification", 
      desc: "Upload Passport or Driver's License", 
      icon: <FileText className={currentStatus === "REJECTED" && !profileData?.identityDoc ? "text-red-500" : "text-blue-500"} />,
      isDone: !!profileData?.identityDoc,
      isRejected: currentStatus === "REJECTED" && !profileData?.identityDoc 
    },
    { 
      id: "BUSINESS", 
      title: "Business Registration", 
      desc: "Upload CAC or Certificate of Incorporation", 
      icon: <Briefcase className={currentStatus === "REJECTED" && !profileData?.businessDoc ? "text-red-500" : "text-orange-500"} />,
      isDone: !!profileData?.businessDoc,
      isRejected: currentStatus === "REJECTED" && !profileData?.businessDoc
    },
    { 
      id: "LOCATION", 
      title: "Business Location", 
      desc: "Upload Utility Bill or Tenancy Agreement", 
      icon: <MapPin className={currentStatus === "REJECTED" && !profileData?.locationDoc ? "text-red-500" : "text-green-500"} />,
      isDone: !!profileData?.locationDoc,
      isRejected: currentStatus === "REJECTED" && !profileData?.locationDoc
    }
  ], [profileData, currentStatus]);

  const triggerUpload = (stepId: string) => {
    if (loading || isRedirecting) return;
    setActiveStep(stepId);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeStep || !vendorProfileId) return;

    if (file.size > 5 * 1024 * 1024) {
      notifyError("File too large (max 5MB)");
      return;
    }

    setLoading(activeStep);

    try {
      const sigResult = await getCloudinarySignature("vendor-docs") as any;
      if (!sigResult?.success) throw new Error("Signature failed");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", sigResult.apiKey);
      formData.append("timestamp", sigResult.timestamp.toString());
      formData.append("signature", sigResult.signature);
      formData.append("folder", "vendor-docs");

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${sigResult.cloudName}/image/upload`,
        { method: "POST", body: formData }
      );
      const uploadData = await uploadRes.json();

      const dbResult = await submitVendorDocs(vendorProfileId, uploadData.secure_url, activeStep);

      if (dbResult?.success) {
        notifySuccess("Upload successful!");

        if (dbResult?.allDocsSubmitted || dbResult?.verificationStatus === "PENDING_REVIEW") {
          setIsRedirecting(true);

          setTimeout(async () => {
            try { await update(); } 
            catch (err) { console.error("Session update failed:", err); }
            router.push("/account/vendor/verification"); 
          }, 1500);
        } else {
          router.refresh();
        }
      }
    } catch (error: any) {
      notifyError(error.message || "Upload failed");
    } finally {
      setLoading(null);
      setActiveStep(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="relative">
      {/* Success Redirect Overlay */}
      {isRedirecting && (
        <div className="fixed inset-0 z-[100] bg-accent-navy/95 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-500">
          <div className="w-24 h-24 bg-brand-primary rounded-full flex items-center justify-center mb-6 animate-bounce">
            <ShieldCheck size={48} className="text-accent-navy" />
          </div>
          <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-2">Documents Secured!</h2>
          <p className="text-blue-100 font-bold max-w-xs uppercase text-xs tracking-[0.2em]">Initiating compliance review protocol...</p>
          <Loader2 className="mt-8 text-brand-primary animate-spin" size={32} />
        </div>
      )}

      <div className={`max-w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ${isRedirecting ? 'opacity-0 scale-95 transition-all duration-500' : 'opacity-100'}`}>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,.pdf" />

        {/* Hero Header */}
        <div className="bg-gradient-to-br from-accent-navy via-[#003366] to-accent-navy rounded-[32px] p-10 text-white shadow-2xl relative overflow-hidden border border-white/10">
          <div className="relative z-10">
            <span className="bg-brand-primary/20 text-brand-primary text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-4 inline-block border border-brand-primary/30">Phase 3: Verification</span>
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-2 italic">Trust & Verification</h1>
            <p className="text-blue-100/80 max-w-md text-sm font-medium leading-relaxed">
              Submit credentials to join our elite marketplace and unlock your <span className="text-brand-primary font-bold ml-1 italic underline decoration-2 underline-offset-4">Verified Merchant Badge</span>.
            </p>
          </div>
          <ShieldCheck size={180} className="absolute right-[-30px] top-[-30px] text-white/5 rotate-12 pointer-events-none" />
        </div>

        {/* Checklist Steps */}
        <div className="grid gap-5">
          {steps.map((step) => (
            <div 
              key={step.id} 
              className={`bg-white border rounded-[2.5rem] p-7 flex flex-col md:flex-row items-start md:items-center justify-between transition-all duration-500 gap-6 group ${
                step.isRejected ? "border-red-200 bg-red-50/30 shadow-inner" : "border-gray-100 hover:shadow-xl hover:border-brand-primary/10"
              }`}
            >
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-[2rem] bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100 group-hover:bg-white group-hover:scale-110 transition-transform duration-500">
                  {step.isDone ? <CheckCircle className="text-green-500" size={32} /> : step.icon}
                </div>
                <div>
                  <h3 className={`text-xl font-black uppercase italic ${step.isRejected ? "text-red-600" : "text-accent-navy"}`}>
                    {step.title} {step.isRejected && " (Action Required)"}
                  </h3>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{step.desc}</p>
                </div>
              </div>

              <div className="flex items-center gap-5 w-full md:w-auto justify-between md:justify-end">
                <StatusBadge status={step.isDone ? "PENDING" : (step.isRejected ? "REJECTED" : currentStatus)} />
                
                {currentStatus !== "APPROVED" && (
                  <button 
                    onClick={() => triggerUpload(step.id)}
                    disabled={!!loading || step.isDone || isRedirecting}
                    className={`relative flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-[0.15em] transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${
                      step.isDone 
                        ? "bg-green-100 text-green-600 shadow-none cursor-default" 
                        : step.isRejected 
                        ? "bg-red-600 text-white hover:bg-red-700" 
                        : "bg-accent-navy text-white hover:bg-brand-primary hover:text-accent-navy"
                    }`}
                  >
                    {loading === step.id ? (
                      <span className="flex items-center gap-2">
                        <Loader2 size={18} className="animate-spin" />
                        Uploading...
                      </span>
                    ) : step.isDone ? (
                      <span className="flex items-center gap-2"><CheckCircle size={18} />Uploaded</span>
                    ) : (
                      <>
                        {step.isRejected ? "Re-upload Now" : "Upload Now"}
                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-orange-50 border border-orange-100 rounded-[2rem] p-8 flex gap-5 items-center shadow-inner">
          <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
            <AlertCircle className="text-orange-600" size={24} />
          </div>
          <div>
            <h4 className="font-black text-orange-900 uppercase text-xs tracking-[0.2em] mb-1">Internal Review Protocol</h4>
            <p className="text-orange-700/80 text-sm font-bold italic leading-tight">
              Our compliance team reviews documents within 24-48 business hours. You will receive a notification once your status updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Suspense wrapper
export default function VerificationCenter(props: Props) {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-brand-primary" /></div>}>
      <VerificationCenterContent {...props} />
    </Suspense>
  );
}

// Status badge
function StatusBadge({ status }: { status: string }) {
  const safeStatus = status || "NOT_STARTED";
  const styles: any = {
    NOT_STARTED: "bg-gray-100 text-gray-400 border-transparent",
    PENDING: "bg-blue-50 text-blue-600 border-blue-100 shadow-sm shadow-blue-100",
    APPROVED: "bg-green-50 text-green-600 border-green-100 shadow-sm shadow-green-100",
    REJECTED: "bg-red-50 text-red-600 border-red-100 shadow-sm shadow-red-100",
    PENDING_REVIEW: "bg-blue-50 text-blue-600 border-blue-100 shadow-sm shadow-blue-100",
  };
  return (
    <div className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shrink-0 border-2 ${styles[safeStatus]}`}>
      {safeStatus.replace("_", " ")}
    </div>
  );
}
