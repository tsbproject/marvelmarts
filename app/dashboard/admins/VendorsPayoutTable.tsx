



// "use client";

// import React, { Component } from "react";
// import { connect } from "react-redux";
// import { useNotification } from "@/app/_context/NotificationContext";
// import { CheckCircle2, XCircle, Banknote, User, Copy } from "lucide-react";
// import { RootState } from "@/store";
// import { processAdminPayout } from "@/store/vendorSlice";
// import { formatNaira } from "@/app/lib/FormatNaira";

// interface PayoutRequest {
//   id: string;
//   amount: number;
//   status: "PENDING" | "APPROVED" | "REJECTED";
//   createdAt: string;
//   name: string; 
//   accountName: string;   
//   accountNumber: string; 
//   bankName: string;      
// }

// interface VendorsPayoutProps {
//   payouts: PayoutRequest[];
//   loading: boolean;
//   dispatch: any; 
//   notifySuccess: (msg: string) => void;
//   notifyError: (msg: string) => void;
// }

// class VendorsPayoutTableClass extends Component<VendorsPayoutProps> {

  
  
//   // Copy Account Number helper
//   copyToClipboard = (text: string) => {
//     navigator.clipboard.writeText(text);
//     this.props.notifySuccess("Account number copied!");
//   };

//   // MERGED ACTION: Handles both Approve and Reject with Remarks
//   handleAction = async (requestId: string, vendor: string, amount: number, action: "APPROVED" | "REJECTED") => {
//     const { notifySuccess, notifyError, dispatch } = this.props;

//     const handleCopy = (text: string | null, label: string) => {
//   if (!text) {
//     notifyError(`NO ${label.toUpperCase()} AVAILABLE TO COPY`);
//     return;
//   }
//   navigator.clipboard.writeText(text);
//   notifySuccess(`${label.toUpperCase()} COPIED`);
// };

//     // 1. Handle Remarks for Rejection
//     const remarks = action === "REJECTED" 
//       ? prompt(`Enter reason for rejecting ${vendor}'s payout of ${formatNaira(amount)}:`) 
//       : "Processed by Admin";
    
//     // Safety check for prompt cancellation
//     if (action === "REJECTED" && remarks === null) return;
//     if (action === "REJECTED" && remarks.trim() === "") {
//       return notifyError("A reason is required for rejection.");
//     }

//     try {
//       // 2. Using the dynamic API route [id]
//       const res = await fetch(`/api/admins/payouts/${requestId}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ status: action, remarks }),
//       });

//       const data = await res.json();

//       if (res.ok) {
//         if (action === "APPROVED") {
//           notifySuccess(`PAYOUT OF ${formatNaira(amount)} FOR ${vendor} APPROVED!`);
//         } else {
//           notifyError(`PAYOUT FOR ${vendor} REJECTED.`);
//         }
        
//         // 3. Update Redux state locally
//         dispatch(processAdminPayout({ requestId, status: action, remarks }));
//       } else {
//         notifyError(data.error || "Failed to process payout.");
//       }
//     } catch (err) {
//       notifyError("Connection error. Please try again.");
//     }
//   };

//   render() {
//     const { payouts, loading } = this.props;

//     return (
//       <div className="bg-white rounded-4xl border border-gray-100 overflow-hidden shadow-sm">
//         <div className="p-8 border-b border-gray-50 flex justify-between items-center">
//           <div>
//             <h2 className="text-xl font-black text-[#002B5B] uppercase tracking-tighter italic">Payout Requests</h2>
//             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Manage vendor withdrawal applications</p>
//           </div>
//           <Banknote className="text-[#002B5B]/20" size={32} />
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full text-left border-collapse">
//             <thead>
//               <tr className="bg-gray-50/50">
//                 <th className="p-5 text-[10px] font-black text-[#002B5B] uppercase tracking-widest border-b border-gray-100 px-8">Vendor</th>
//                 <th className="p-5 text-[10px] font-black text-[#002B5B] uppercase tracking-widest border-b border-gray-100">Settlement Account</th>
//                 <th className="p-5 text-[10px] font-black text-[#002B5B] uppercase tracking-widest border-b border-gray-100">Amount</th>
//                 <th className="p-5 text-[10px] font-black text-[#002B5B] uppercase tracking-widest border-b border-gray-100 text-right px-8">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-50">
//               {payouts.length === 0 ? (
//                 <tr>
//                   <td colSpan={4} className="p-10 text-center text-gray-400 font-bold uppercase text-xs tracking-widest">No pending requests</td>
//                 </tr>
//               ) : (
//                 payouts.map((request) => (
//                   <tr key={request.id} className="hover:bg-gray-50/30 transition-all">
//                     {/* VENDOR COLUMN */}
//                     <td className="p-5 px-8">
//                       <div className="flex items-center gap-3">
//                         <div className="w-10 h-10 rounded-2xl bg-[#002B5B]/5 flex items-center justify-center text-[#002B5B]">
//                           <User size={18} />
//                         </div>
//                         <span className="font-black text-xs text-[#002B5B] uppercase tracking-tight">{request.name}</span>
//                       </div>
//                     </td>

//                     {/* BANK DETAILS COLUMN */}
//                     <td className="p-5">
//                       <div className="flex flex-col gap-0.5">
//                         <span className="text-[10px] font-black text-[#002B5B] uppercase tracking-tighter">
//                           {request.bankName}
//                         </span>
//                         <div 
//                           className="flex items-center gap-2 group cursor-pointer"
//                           onClick={() => this.copyToClipboard(request.accountNumber)}
//                         >
//                           <span className="text-xs font-mono font-bold text-gray-600 group-hover:text-[#002B5B] transition-colors">
//                             {request.accountNumber}
//                           </span>
//                           <Copy size={12} className="text-gray-300 group-hover:text-[#002B5B] transition-colors" />
//                         </div>
//                         <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
//                           {request.accountName}
//                         </span>
//                       </div>
//                     </td>

//                     {/* AMOUNT COLUMN */}
//                     <td className="p-5 font-black text-sm text-[#002B5B] tracking-tighter">
//                       {formatNaira(request.amount)}
//                     </td>

//                     {/* ACTIONS COLUMN */}
//                     <td className="p-5 px-8">
//                       <div className="flex items-center justify-end gap-3">
//                         <button
//                           disabled={loading}
//                           onClick={() => this.handleAction(request.id, request.name, request.amount, "APPROVED")}
//                           className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-600/20 hover:scale-105 transition-all disabled:opacity-50"
//                         >
//                           <CheckCircle2 size={14} /> Approve
//                         </button>
//                         <button
//                           disabled={loading}
//                           onClick={() => this.handleAction(request.id, request.name, request.amount, "REJECTED")}
//                           className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-600/20 hover:scale-105 transition-all disabled:opacity-50"
//                         >
//                           <XCircle size={14} /> Reject
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     );
//   }
// }

// const mapStateToProps = (state: RootState) => {
//   const rawPayouts = state.vendor.payouts || []; 

//   return {
//     payouts: rawPayouts
//       .filter((p: any) => p.status === "PENDING")
//       .map((p: any) => ({
//         id: p.id,
//         name: p.vendorName || p.vendor?.name || "Unknown Vendor",
//         amount: p.amount,
//         status: p.status,
//         accountName: p.accountName,
//         accountNumber: p.accountNumber,
//         bankName: p.bankName,
//         createdAt: p.createdAt
//       })),
//     loading: state.vendor.loading,
//   };
// };

// const ConnectedTable = connect(mapStateToProps)(VendorsPayoutTableClass);

// export default function VendorsPayoutTable(props: any) {
//   const { notifySuccess, notifyError } = useNotification();
//   return <ConnectedTable {...props} notifySuccess={notifySuccess} notifyError={notifyError} />;
// }






"use client";

import React, { Component } from "react";
import { connect } from "react-redux";
import { useNotification } from "@/app/_context/NotificationContext";
import { CheckCircle2, XCircle, Banknote, User, Copy } from "lucide-react";
import { RootState } from "@/store";
import { processAdminPayout } from "@/store/vendorSlice";
import { formatNaira } from "@/app/lib/FormatNaira";

interface PayoutRequest {
  id: string;
  amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  name: string; 
  accountName: string;   
  accountNumber: string; 
  bankName: string;      
}

interface VendorsPayoutProps {
  payouts: PayoutRequest[];
  loading: boolean;
  dispatch: any; 
  notifySuccess: (msg: string) => void;
  notifyError: (msg: string) => void;
}

class VendorsPayoutTableClass extends Component<VendorsPayoutProps> {

  // UPDATED: Safety Copy Logic to prevent copying "null"
  copyToClipboard = (text: string | null, label: string) => {
    if (!text || text === "null" || text.trim() === "") {
      this.props.notifyError(`CANNOT COPY: ${label.toUpperCase()} IS MISSING`);
      return;
    }
    navigator.clipboard.writeText(text);
    this.props.notifySuccess(`${label.toUpperCase()} COPIED!`);
  };

  handleAction = async (requestId: string, vendor: string, amount: number, action: "APPROVED" | "REJECTED") => {
    const { notifySuccess, notifyError, dispatch } = this.props;

    // 1. Handle Remarks for Rejection
    const remarks = action === "REJECTED" 
      ? prompt(`Enter reason for rejecting ${vendor}'s payout of ${formatNaira(amount)}:`) 
      : "Processed by Admin";
    
    if (action === "REJECTED" && remarks === null) return;
    if (action === "REJECTED" && remarks.trim() === "") {
      return notifyError("A reason is required for rejection.");
    }

    try {
      const res = await fetch(`/api/admins/payouts/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action, remarks }),
      });

      const data = await res.json();

      if (res.ok) {
        if (action === "APPROVED") {
          notifySuccess(`PAYOUT OF ${formatNaira(amount)} FOR ${vendor} APPROVED!`);
        } else {
          notifyError(`PAYOUT FOR ${vendor} REJECTED.`);
        }
        
        dispatch(processAdminPayout({ requestId, status: action, remarks }));
      } else {
        notifyError(data.error || "Failed to process payout.");
      }
    } catch (err) {
      notifyError("Connection error. Please try again.");
    }
  };

  render() {
    const { payouts, loading } = this.props;

    return (
      <div className="bg-white rounded-4xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-[#002B5B] uppercase tracking-tighter italic">Payout Requests</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Manage vendor withdrawal applications</p>
          </div>
          <Banknote className="text-[#002B5B]/20" size={32} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="p-5 text-[10px] font-black text-[#002B5B] uppercase tracking-widest border-b border-gray-100 px-8">Vendor</th>
                <th className="p-5 text-[10px] font-black text-[#002B5B] uppercase tracking-widest border-b border-gray-100">Settlement Account</th>
                <th className="p-5 text-[10px] font-black text-[#002B5B] uppercase tracking-widest border-b border-gray-100">Amount</th>
                <th className="p-5 text-[10px] font-black text-[#002B5B] uppercase tracking-widest border-b border-gray-100 text-right px-8">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payouts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-gray-400 font-bold uppercase text-xs tracking-widest">No pending requests</td>
                </tr>
              ) : (
                payouts.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50/30 transition-all">
                    <td className="p-5 px-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#002B5B]/5 flex items-center justify-center text-[#002B5B]">
                          <User size={18} />
                        </div>
                        <span className="font-black text-xs text-[#002B5B] uppercase tracking-tight">{request.name}</span>
                      </div>
                    </td>

                    <td className="p-5">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-black text-[#002B5B] uppercase tracking-tighter">
                          {request.bankName || "BANK NOT SET"}
                        </span>
                        <div 
                          className="flex items-center gap-2 group cursor-pointer"
                          onClick={() => this.copyToClipboard(request.accountNumber, "Account Number")}
                        >
                          <span className={`text-xs font-mono font-bold transition-colors ${request.accountNumber ? "text-gray-600 group-hover:text-[#002B5B]" : "text-red-400 italic"}`}>
                            {request.accountNumber || "MISSING_ACC_NO"}
                          </span>
                          {request.accountNumber && <Copy size={12} className="text-gray-300 group-hover:text-[#002B5B] transition-colors" />}
                        </div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                          {request.accountName || "NAME NOT PROVIDED"}
                        </span>
                      </div>
                    </td>

                    <td className="p-5 font-black text-sm text-[#002B5B] tracking-tighter">
                      {formatNaira(request.amount)}
                    </td>

                    <td className="p-5 px-8">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          disabled={loading || !request.accountNumber}
                          onClick={() => this.handleAction(request.id, request.name, request.amount, "APPROVED")}
                          className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-600/20 hover:scale-105 transition-all disabled:opacity-30 disabled:grayscale disabled:scale-100"
                        >
                          <CheckCircle2 size={14} /> Approve
                        </button>
                        <button
                          disabled={loading}
                          onClick={() => this.handleAction(request.id, request.name, request.amount, "REJECTED")}
                          className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-600/20 hover:scale-105 transition-all disabled:opacity-50"
                        >
                          <XCircle size={14} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => {
  const rawPayouts = state.vendor.payouts || []; 

  return {
    payouts: rawPayouts
      .filter((p: any) => p.status === "PENDING")
      .map((p: any) => ({
        id: p.id,
        name: p.vendorName || p.vendor?.name || "Unknown Vendor",
        amount: p.amount,
        status: p.status,
        accountName: p.accountName,
        accountNumber: p.accountNumber,
        bankName: p.bankName,
        createdAt: p.createdAt
      })),
    loading: state.vendor.loading,
  };
};

const ConnectedTable = connect(mapStateToProps)(VendorsPayoutTableClass);

export default function VendorsPayoutTable(props: any) {
  const { notifySuccess, notifyError } = useNotification();
  return <ConnectedTable {...props} notifySuccess={notifySuccess} notifyError={notifyError} />;
}