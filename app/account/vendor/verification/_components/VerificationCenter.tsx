"use client";

import { useState, useRef } from "react";
import { 
  ShieldCheck, FileText, MapPin, Phone, 
  Clock, CheckCircle, AlertCircle, ChevronRight, UploadCloud 
} from "lucide-react";
import { useNotification } from "@/app/_context/NotificationContext";
import { submitVendorDocs } from "@/app/_actions/admin-actions"
import { processVendorApproval } from "@/app/_actions/admin-actions";
import { getCloudinarySignature } from "@/app/_actions/upload-actions";
import { useRouter } from "next/navigation";

type VerificationStatus = "NOT_STARTED" | "PENDING" | "APPROVED" | "REJECTED";

interface Props {
  vendorProfileId: string;
  currentStatus: VerificationStatus;
}

export default function VerificationCenter({ vendorProfileId, currentStatus }: Props) {
  const { notifySuccess, notifyError } = useNotification();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<string | null>(null);

  // --- THE STEPS DEFINITION (Fixed: Was missing or out of scope) ---
  const steps = [
    { 
      id: "IDENTITY", 
      title: "Identity Verification", 
      desc: "Upload Passport or Driver's License", 
      icon: <FileText className="text-blue-500" /> 
    },
    { 
      id: "LOCATION", 
      title: "Business Location", 
      desc: "Upload Utility Bill or Tenancy Agreement", 
      icon: <MapPin className="text-green-500" /> 
    },
    { 
      id: "PHONE", 
      title: "Phone Verification", 
      desc: "Secure your account with a verified business line", 
      icon: <Phone className="text-purple-500" /> 
    }
  ];

  const triggerUpload = (stepId: string) => {
    setActiveStep(stepId);
    fileInputRef.current?.click();
  };

 const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  
  // 1. Ensure we have the Profile ID (using the prop vendorId)
  if (!vendorProfileId) {
    notifyError("Error: Vendor Profile ID is missing.");
    return;
  }

  if (!file || !activeStep) return;

  setLoading(activeStep);
  
  try {
    // 2. Get the Permission Slip (Signature)
    const sigResult = await getCloudinarySignature("vendor-docs");
    
    if (!sigResult || !sigResult.success || !sigResult.timestamp || !sigResult.signature) {
      throw new Error(sigResult?.error || "Failed to get upload authorization");
    }

    // 3. Construct the Upload Data
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", sigResult.apiKey || "");
    formData.append("timestamp", sigResult.timestamp.toString());
    formData.append("signature", sigResult.signature);
    formData.append("folder", "vendor-docs");

    // 4. Fire the upload directly to Cloudinary
    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${sigResult.cloudName}/image/upload`,
      { method: "POST", body: formData }
    );

    const uploadData = await uploadRes.json();
    
    if (!uploadRes.ok || uploadData.error) {
      throw new Error(uploadData.error?.message || "Cloudinary upload failed");
    }

    // 5. Use your existing SUBMIT action to save the URL
    // We pass the Profile ID and the secure_url from Cloudinary
    const dbResult = await submitVendorDocs(vendorProfileId, uploadData.secure_url);

    if (dbResult.success) {
      notifySuccess("Document uploaded and sent to Admin!");
      router.refresh(); 
    } else {
      throw new Error("Cloudinary worked, but Database sync failed.");
    }

  } catch (error: any) {
    console.error("Verification Flow Error:", error);
    notifyError(error.message || "An unexpected error occurred");
  } finally {
    setLoading(null);
    setActiveStep(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }
};
  return (
    <div className="max-w-full space-y-8">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*,.pdf"
      />

      {/* Header Section */}
      <div className="bg-gradient-to-r from-accent-navy to-[#004080] rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-black uppercase tracking-tight mb-2">Trust & Verification</h1>
          <p className="text-blue-100 max-w-md">Complete your verification to unlock the <span className="text-brand-primary font-bold">Verified Merchant Badge</span>.</p>
        </div>
        <ShieldCheck size={120} className="absolute right-[-20px] top-[-20px] text-white/10 rotate-12 pointer-events-none" />
      </div>

      {/* Steps List */}
      <div className="grid gap-4">
        {steps.map((step) => (
          <div key={step.id} className="bg-white border border-gray-100 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between hover:shadow-md transition-shadow gap-4">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center shrink-0">
                {step.icon}
              </div>
              <div>
                <h3 className="text-xl font-black text-accent-navy uppercase tracking-tight leading-none mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm font-medium">{step.desc}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
              <StatusBadge status={currentStatus} />
              
              {currentStatus !== "APPROVED" && (
                <button 
                  onClick={() => triggerUpload(step.id)}
                  disabled={!!loading}
                  className="relative z-20 flex items-center gap-2 bg-accent-navy text-white px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-widest hover:scale-105 transition-all disabled:opacity-50"
                >
                  {loading === step.id ? (
                    <span className="flex items-center gap-2">
                      <UploadCloud size={16} className="animate-bounce" />
                      Uploading...
                    </span>
                  ) : (
                    <>
                      Start Now
                      <ChevronRight size={16} />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Admin Notice */}
      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 flex gap-4 items-start">
        <AlertCircle className="text-orange-500 shrink-0" size={24} />
        <div>
          <h4 className="font-bold text-orange-900 uppercase text-xs tracking-widest mb-1">Processing Time</h4>
          <p className="text-orange-700 text-sm font-medium">Verification documents are reviewed within 24-48 business hours.</p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const safeStatus = status || "NOT_STARTED";
  const styles: any = {
    NOT_STARTED: "bg-gray-100 text-gray-400",
    PENDING: "bg-blue-50 text-blue-600 border border-blue-100",
    APPROVED: "bg-green-50 text-green-600 border border-green-100",
    REJECTED: "bg-red-50 text-red-600 border border-red-100",
  };

  const icons: any = {
    NOT_STARTED: null,
    PENDING: <Clock size={14} />,
    APPROVED: <CheckCircle size={14} />,
    REJECTED: <AlertCircle size={14} />,
  };

  return (
    <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shrink-0 ${styles[safeStatus]}`}>
      {icons[safeStatus]}
      {safeStatus.replace("_", " ")}
    </div>
  );
}