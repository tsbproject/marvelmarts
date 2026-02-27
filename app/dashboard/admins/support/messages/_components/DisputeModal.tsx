// "use client";

// import { useState } from "react";
// import { ShieldAlert, Octagon, RotateCcw, Loader2 } from "lucide-react";
// import { useNotification } from "@/app/_context/NotificationContext"; 

// export default function DisputeModal({ vendorProfileId, vendorName }: { vendorProfileId: string, vendorName: string }) {
//   const [isOpen, setIsOpen] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [reason, setReason] = useState("");
  
//   // 2. Initializing your custom notification functions
//   const { notifySuccess, notifyError } = useNotification();

//   const handleAction = async (action: "SUSPEND" | "FLAG" | "RESTORE") => {
//   if (!reason) {
//     // Corrected to 1 argument
//     return notifyError("Please provide a reason for this action.");
//   }
  
//   setLoading(true);
//   try {
//    // Inside DisputeModal.tsx
//       const res = await fetch("/api/admins/dispute", { 
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ vendorProfileId, action, reason }),
//       });

//     if (res.ok) {
//       // Corrected to 1 argument
//       notifySuccess(`Success: Vendor ${vendorName} has been ${action.toLowerCase()}ed.`);
//       setIsOpen(false);
//       setReason(""); 
//     } else {
//       throw new Error();
//     }
//   } catch (error) {
//     notifyError("Failed to execute action. Please check system logs.");
//   } finally {
//     setLoading(false);
//   }
// };

//   if (!isOpen) return (
//     <button 
//       onClick={() => setIsOpen(true)}
//       className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm"
//     >
//       <ShieldAlert size={14} /> Enforcement Tools
//     </button>
//   );

//   return (
//     <div className="fixed inset-0 z-[100] flex items-center justify-center bg-accent-navy/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
//       <div className="bg-white w-full max-w-md rounded-4xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
//         <div className="flex items-center gap-4 mb-6">
//           <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600">
//             <Octagon size={28} />
//           </div>
//           <div>
//             <h3 className="text-xl font-black text-accent-navy uppercase tracking-tight">Dispute Action</h3>
//             <p className="text-xs font-bold text-neutral-gray uppercase">Target: {vendorName}</p>
//           </div>
//         </div>

//         <textarea 
//           value={reason}
//           onChange={(e) => setReason(e.target.value)}
//           placeholder="State the violation (this will be logged in chat history)..."
//           className="w-full h-32 bg-gray-50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-red-500 mb-6 transition-all"
//         />

//         <div className="grid grid-cols-2 gap-3">
//           <button 
//             onClick={() => handleAction("SUSPEND")}
//             disabled={loading}
//             className="flex items-center justify-center gap-2 py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-700 transition-all shadow-md active:scale-95"
//           >
//             {loading ? <Loader2 size={16} className="animate-spin" /> : <Octagon size={16} />} Suspend
//           </button>

//           <button 
//             onClick={() => handleAction("RESTORE")}
//             disabled={loading}
//             className="flex items-center justify-center gap-2 py-4 bg-accent-navy text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-md active:scale-95"
//           >
//             <RotateCcw size={16} /> Restore
//           </button>
//         </div>

//         <button 
//           onClick={() => setIsOpen(false)}
//           className="w-full mt-4 py-3 text-neutral-gray font-bold uppercase text-[9px] tracking-widest hover:text-accent-navy transition-colors"
//         >
//           Close Panel
//         </button>
//       </div>
//     </div>
//   );
// }




"use client";

import { useState } from "react";
import { ShieldAlert, Octagon, RotateCcw, Loader2, ChevronDown } from "lucide-react";
import { useNotification } from "@/app/_context/NotificationContext"; 

// Defined Presets for MarvelMarts Compliance
const REASON_PRESETS = [
  { label: "Counterfeit / IP Violation", value: "The vendor is listing items that violate intellectual property rights or are non-authentic." },
  { label: "Payment Fraud Suspicion", value: "Irregularities detected in transaction patterns or payout requests." },
  { label: "Communication Policy", value: "Vendor is using offensive language or attempting to take transactions off-platform." },
  { label: "Shipping / Logistics Delay", value: "Consistent failure to fulfill orders within the stipulated MarvelMarts window." },
  { label: "Prohibited Items", value: "Listing items that are on the restricted or illegal goods list." },
  { label: "Other / Manual Entry", value: "" },
];

export default function DisputeModal({ vendorProfileId, vendorName }: { vendorProfileId: string, vendorName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const { notifySuccess, notifyError } = useNotification();

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setReason(e.target.value);
  };

  const handleAction = async (action: "SUSPEND" | "FLAG" | "RESTORE") => {
    if (!reason.trim()) {
      return notifyError("Please provide or select a reason for this action.");
    }
    
    setLoading(true);
    try {
      const res = await fetch("/api/admins/dispute", { 
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorProfileId, action, reason }),
      });

      if (res.ok) {
        notifySuccess(`Success: Vendor ${vendorName} has been ${action.toLowerCase()}ed.`);
        setIsOpen(false);
        setReason(""); 
      } else {
        throw new Error();
      }
    } catch (error) {
      notifyError("Failed to execute action. Please check system logs.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return (
    <button 
      onClick={() => setIsOpen(true)}
      className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm"
    >
      <ShieldAlert size={14} /> Enforcement Tools
    </button>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#002B5B]/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-4xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600">
            <Octagon size={28} />
          </div>
          <div>
            <h3 className="text-xl font-black text-[#002B5B] uppercase tracking-tight">Dispute Action</h3>
            <p className="text-xs font-bold text-neutral-400 uppercase">Target: {vendorName}</p>
          </div>
        </div>

        {/* Preset Dropdown */}
        <div className="mb-4">
          <label className="text-[10px] font-black uppercase text-neutral-400 mb-2 block ml-1">Quick Reason Select</label>
          <div className="relative">
            <select 
              onChange={handlePresetChange}
              className="w-full bg-gray-50 border-none rounded-2xl p-4 text-xs font-bold text-[#002B5B] appearance-none cursor-pointer focus:ring-2 focus:ring-red-500 transition-all"
            >
              <option value="">-- Choose a Violation Preset --</option>
              {REASON_PRESETS.map((p) => (
                <option key={p.label} value={p.value}>{p.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-4 text-neutral-400 pointer-events-none" size={16} />
          </div>
        </div>

        <textarea 
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Or type a custom violation description here..."
          className="w-full h-32 bg-gray-50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-red-500 mb-6 transition-all"
        />

        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => handleAction("SUSPEND")}
            disabled={loading}
            className="flex items-center justify-center gap-2 py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-700 transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Octagon size={16} />} Suspend
          </button>

          <button 
            onClick={() => handleAction("RESTORE")}
            disabled={loading}
            className="flex items-center justify-center gap-2 py-4 bg-[#002B5B] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            <RotateCcw size={16} /> Restore
          </button>
        </div>

        <button 
          onClick={() => setIsOpen(false)}
          className="w-full mt-4 py-3 text-neutral-400 font-bold uppercase text-[9px] tracking-widest hover:text-[#002B5B] transition-colors"
        >
          Close Panel
        </button>
      </div>
    </div>
  );
}