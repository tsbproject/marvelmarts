// "use client";

// import { useState, useEffect } from "react";
// import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

// export default function AdminRefundDecisionModal({ 
//   isOpen, 
//   onClose, 
//   onConfirm, 
//   action 
// }: { 
//   isOpen: boolean; 
//   onClose: () => void; 
//   onConfirm: (reason: string) => void;
//   action: "approved" | "rejected" | null;
// }) {
//   const [reason, setReason] = useState("");
//   const isApprove = action === "approved";

//   // Reset reason when modal closes/opens
//   useEffect(() => {
//     if (!isOpen) setReason("");
//   }, [isOpen]);

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-md transition-all">
//       <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl border border-gray-100">
        
//         {/* Header Section */}
//         <div className="flex flex-col items-center text-center mb-8">
//           <div className={`p-4 rounded-full mb-4 shadow-sm ${isApprove ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
//             {isApprove ? <CheckCircle size={48} strokeWidth={2.5} /> : <XCircle size={48} strokeWidth={2.5} />}
//           </div>
          
//           <h2 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900">
//             {isApprove ? "Authorize Reversal" : "Decline Request"}
//           </h2>
          
//           <div className="mt-3 flex items-start justify-center gap-2 px-6">
//             <AlertCircle size={14} className={isApprove ? "text-green-600 shrink-0" : "text-red-600 shrink-0"} />
//             <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest leading-relaxed">
//               {isApprove 
//                 ? "Execute financial reversal. This action triggers immediate bank notification." 
//                 : "Protocol violation detected. Provide a justification for the asset owner."}
//             </p>
//           </div>
//         </div>

//         {/* Input Section */}
//         <div className="space-y-3">
//           <div className="flex justify-between items-center px-4">
//             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
//               Decision Justification
//             </label>
//             <span className={`text-[9px] font-black uppercase tracking-widest ${reason.length < 10 ? 'text-red-500' : 'text-green-600'}`}>
//               {reason.length} Characters
//             </span>
//           </div>
          
//           <textarea
//             className={`w-full h-32 p-6 bg-gray-50 border-2 rounded-[2rem] text-sm font-bold text-gray-900 outline-none transition-all resize-none placeholder:text-gray-300 ${
//               isApprove ? 'focus:border-green-600/20' : 'focus:border-red-600/20'
//             }`}
//             placeholder={isApprove ? "e.g., Customer return verified. Condition: Mint." : "e.g., Item shows signs of outdoor use. Tag removal detected."}
//             value={reason}
//             onChange={(e) => setReason(e.target.value)}
//             autoFocus
//           />
//           <p className="text-[9px] text-center font-bold text-gray-400 uppercase tracking-tighter">
//             * This note will be included in the official resolution email.
//           </p>
//         </div>

//         {/* Action Buttons */}
//         <div className="mt-10 flex flex-col gap-3">
//           <button
//             disabled={!reason.trim() || (reason.length < 5)}
//             onClick={() => onConfirm(reason)}
//             className={`w-full py-5 rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:grayscale disabled:scale-100 ${
//               isApprove 
//                 ? "bg-green-600 text-white hover:bg-green-700 shadow-green-100" 
//                 : "bg-red-600 text-white hover:bg-red-700 shadow-red-100"
//             }`}
//           >
//             Confirm {action}
//           </button>
          
//           <button 
//             onClick={onClose} 
//             className="py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors"
//           >
//             Abort Protocol
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }




"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, ShieldAlert } from "lucide-react";

export default function AdminRefundDecisionModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  action 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: (reason: string) => void;
  action: "approved" | "rejected" | null;
}) {
  const [reason, setReason] = useState("");
  const isApprove = action === "approved";
  const isReject = action === "rejected";

  // Reset reason when modal closes/opens
  useEffect(() => {
    if (!isOpen) setReason("");
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-md transition-all">
      <div className="bg-white w-full max-w-lg rounded-[3.5rem] p-10 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-300">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className={`p-5 rounded-full mb-4 shadow-sm ${isApprove ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {isApprove ? (
              <CheckCircle size={52} strokeWidth={2.5} className="animate-pulse" />
            ) : (
              <ShieldAlert size={52} strokeWidth={2.5} className="animate-bounce" />
            )}
          </div>
          
          <h2 className={`text-3xl font-black uppercase italic tracking-tighter ${isApprove ? 'text-green-700' : 'text-red-700'}`}>
            {isApprove ? "Authorize Reversal" : "Decline Request"}
          </h2>
          
          <div className="mt-3 flex items-start justify-center gap-2 px-6">
            <AlertCircle size={14} className={isApprove ? "text-green-600 shrink-0 mt-1" : "text-red-600 shrink-0 mt-1"} />
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest leading-relaxed">
              {isApprove 
                ? "Execute financial reversal. This action triggers immediate bank notification and inventory restock." 
                : "Protocol violation detected. You are about to officially decline this customer's refund request."}
            </p>
          </div>
        </div>

        {/* Input Section */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
              {isApprove ? "Approval Note" : "Rejection Justification"}
            </label>
            <span className={`text-[9px] font-black uppercase tracking-widest ${reason.length < 5 ? 'text-red-400' : 'text-green-600'}`}>
              {reason.length} / 5 Min Chars
            </span>
          </div>
          
          <textarea
            className={`w-full h-36 p-6 bg-gray-50 border-2 rounded-[2.5rem] text-sm font-bold text-gray-900 outline-none transition-all resize-none placeholder:text-gray-300 placeholder:font-medium ${
              isApprove 
                ? 'focus:border-green-500 focus:bg-white border-green-50' 
                : 'focus:border-red-500 focus:bg-white border-red-50'
            }`}
            placeholder={isApprove 
              ? "e.g., Return quality verified. Processing immediate credit..." 
              : "e.g., Item shows visible signs of wear. Policy requires original tags and mint condition."}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            autoFocus
          />
          <div className="flex items-center justify-center gap-2">
            <span className="w-1 h-1 rounded-full bg-orange-400" />
            <p className="text-[9px] text-center font-bold text-gray-400 uppercase tracking-tighter">
              This reason will be logged in the system and emailed to the user.
            </p>
            <span className="w-1 h-1 rounded-full bg-orange-400" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-col gap-3">
          <button
            disabled={reason.length < 5}
            onClick={() => onConfirm(reason)}
            className={`w-full py-5 rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed ${
              isApprove 
                ? "bg-green-600 text-white hover:bg-green-700 shadow-green-100" 
                : "bg-red-600 text-white hover:bg-red-700 shadow-red-100"
            }`}
          >
            Confirm {isApprove ? "Refund Approval" : "Request Rejection"}
          </button>
          
          <button 
            onClick={onClose} 
            className="py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors flex items-center justify-center gap-2"
          >
            <XCircle size={14} /> Abort Protocol
          </button>
        </div>
      </div>
    </div>
  );
}