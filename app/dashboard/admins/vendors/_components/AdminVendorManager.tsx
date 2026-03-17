


// "use client";

// import React, { useState, useEffect } from "react";
// import Image from "next/image";
// import { 
//   CheckCircle, Store as StoreIcon, Mail, Loader2, Search, AlertCircle, 
//   PauseCircle, Trash2, RefreshCcw, ShieldAlert, XCircle,
//   ChevronLeft, ChevronRight, Filter, X, Eye, CreditCard, Globe, Octagon, RotateCcw
// } from "lucide-react";
// import { useNotification } from "@/app/_context/NotificationContext";
// import { useDispatch, useSelector } from "react-redux";
// import { RootState } from "@/store"; 
// import { 
//   setAllVendors, 
//   updateVendorStatusInStore, 
//   setSearchQuery, 
//   setCurrentPage,
//   setStatusFilter 
// } from "@/store/vendorSlice";

// interface VendorProfile {
//   id: string;
//   userId: string; 
//   storeName: string;
//   status: "PENDING" | "APPROVED" | "REJECTED";
//   isSuspended: boolean;
//   logoUrl?: string;
//   coverUrl?: string;
//   bio?: string;
//   bankName?: string;
//   accountNumber?: string;
//   accountName?: string;
//   instagram?: string;
//   whatsapp?: string;
//   twitter?: string;
//   user: {
//     email: string;
//     name: string;
//   };

//   identityDoc?: string;   
//   businessDoc?: string;   
//   locationDoc?: string;   


//   verificationDoc?: string; 
// }

// const itemsPerPage = 10;

// export default function AdminVendorManager() {
//   const { notifyError, notifySuccess } = useNotification();
//   const dispatch = useDispatch();
  
//   const { vendors, searchQuery, statusFilter, currentPage } = useSelector((state: any) => state.vendor);
//   const [loading, setLoading] = useState(true);
//   const [actionId, setActionId] = useState<string | null>(null);
//   const [selectedVendor, setSelectedVendor] = useState<VendorProfile | null>(null);
  
//   const [enforcementModal, setEnforcementModal] = useState<{ isOpen: boolean; vendor: VendorProfile | null; action: "SUSPEND" | "RESTORE" | null }>({
//     isOpen: false,
//     vendor: null,
//     action: null
//   });
//   const [enforcementReason, setEnforcementReason] = useState("");

//   const filteredVendors = vendors.filter((v: VendorProfile) => {
//     const query = searchQuery.toLowerCase();
//     const matchesSearch = (
//       v.id.toLowerCase().includes(query) ||
//       v.storeName.toLowerCase().includes(query) ||
//       v.user.name.toLowerCase().includes(query) ||
//       v.user.email.toLowerCase().includes(query)
//     );

//     const matchesStatus = 
//       statusFilter === "ALL" ? true :
//       statusFilter === "SUSPENDED" ? v.isSuspended :
//       v.status === statusFilter;

//     return matchesSearch && matchesStatus;
//   });

//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentVendors = filteredVendors.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);

//   async function fetchVendors() {
//     try {
//       const res = await fetch("/api/admins/vendors");
//       const data = await res.json();
//       if (res.ok) {
//         dispatch(setAllVendors(data.vendors));
//       } else {
//         notifyError(data.error || "Could not load vendors");
//       }
//     } catch (err) {
//       notifyError("Connection error");
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => { fetchVendors(); }, []);

//   async function handleVendorAction(
//   vendorProfileId: string,
//   action: "APPROVE" | "REJECT" | "DELETE"
//     ) {
//       if (action === "DELETE" && !confirm("Permanently delete this vendor?")) return;

//       setActionId(`${vendorProfileId}-${action}`);

//       try {
//         const res = await fetch("/api/admins/vendors/status", {
//           method: "PATCH",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ vendorProfileId, action }),
//         });

//         const data = await res.json();

//         if (!res.ok) {
//           notifyError(data.error || `Failed to ${action.toLowerCase()} vendor`);
//           return;
//         }

//         if (action === "DELETE") {
//           await fetchVendors();
//           notifySuccess("Vendor deleted successfully");
//           return;
//         }

//         dispatch(
//           updateVendorStatusInStore({
//             vendorProfileId,
//             status: data.vendor?.status,
//             isSuspended: data.vendor?.isSuspended,
//           })
//         );

//         notifySuccess(`Vendor ${action.toLowerCase()} successful`);

//         if (selectedVendor?.id === vendorProfileId) {
//           setSelectedVendor(data.vendor ?? null);
//         }
//       } catch (err) {
//         notifyError("Connection error");
//       } finally {
//         setActionId(null);
//       }
//     }

//     async function handleEnforcement() {
//       if (!enforcementReason.trim()) {
//         notifyError("Reason Required: Please state why this action is being taken.");
//         return;
//       }

//       const { vendor, action } = enforcementModal;
//       if (!vendor || !action) return;

//       setActionId(`${vendor.id}-${action}`);

//       try {
//         const res = await fetch("/api/admins/vendors/status", {
//           method: "PATCH",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             vendorProfileId: vendor.id,
//             action: action === "RESTORE" ? "UNSUSPEND" : "SUSPEND",
//             reason: enforcementReason,
//           }),
//         });

//         const data = await res.json();

//         if (!res.ok) {
//           notifyError(data.error || "Failed to update vendor");
//           return;
//         }

//         dispatch(
//           updateVendorStatusInStore({
//             vendorProfileId: vendor.id,
//             status: data.vendor?.status,
//             isSuspended: data.vendor?.isSuspended,
//           })
//         );

//         notifySuccess(
//           `Vendor ${vendor.storeName} ${action === "SUSPEND" ? "suspended" : "restored"} successfully`
//         );

//         setEnforcementModal({ isOpen: false, vendor: null, action: null });
//         setEnforcementReason("");

//         if (selectedVendor?.id === vendor.id) {
//           setSelectedVendor(data.vendor ?? null);
//         }
//       } catch (err) {
//         notifyError("Connection error");
//       } finally {
//         setActionId(null);
//       }
//     }

//   if (loading) return (
//     <div className="flex h-64 items-center justify-center">
//       <Loader2 className="animate-spin text-[#F7931E]" size={40} />
//     </div>
//   );

//    return (
//     <div className="relative">
//       <div className={`bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden transition-all duration-500 ${selectedVendor ? 'mr-[400px]' : 'mr-0'}`}>
//         <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between gap-4 bg-white">
//           <div>
//             <h3 className="text-xl font-black text-[#002B5B]">Merchant Control Center</h3>
//             <p className="text-sm font-bold text-gray-500 italic">Manage store verifications, suspensions, and access</p>
//           </div>
//           <div className="flex flex-wrap items-center gap-3">
//             <div className="relative">
//                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
//                <select 
//                  value={statusFilter}
//                  onChange={(e) => dispatch(setStatusFilter(e.target.value as any))}
//                  className="pl-9 pr-4 py-2 bg-gray-50 rounded-xl text-xs font-black uppercase outline-none border-none focus:ring-2 focus:ring-[#F7931E]/20 text-[#002B5B] appearance-none cursor-pointer"
//                >
//                  <option value="ALL">All Status</option>
//                  <option value="PENDING">Pending</option>
//                  <option value="APPROVED">Verified</option>
//                  <option value="REJECTED">Rejected</option>
//                  <option value="SUSPENDED">Suspended</option>
//                </select>
//             </div>

//             <div className="relative">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
//               <input 
//                 type="text" 
//                 value={searchQuery}
//                 onChange={(e) => dispatch(setSearchQuery(e.target.value))}
//                 placeholder="Search ID, Store or Name..." 
//                 className="pl-10 pr-4 py-2 bg-gray-50 rounded-xl text-sm font-bold outline-none border-none focus:ring-2 focus:ring-[#F7931E]/20 w-full md:w-64" 
//               />
//             </div>
//           </div>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full text-left border-collapse">
//             <thead className="bg-gray-50/50">
//               <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
//                 <th className="px-8 py-4">Vendor Details</th>
//                 <th className="px-8 py-4">Verification Status</th>
//                 <th className="px-8 py-4 text-right">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-50">
//               {currentVendors.length === 0 ? (
//                 <tr>
//                   <td colSpan={3} className="px-8 py-12 text-center text-gray-400 font-bold italic">No vendors found matching criteria.</td>
//                 </tr>
//               ) : (
//                  currentVendors.map((vendor: VendorProfile) => (
//                   <tr key={vendor.id} className="group hover:bg-gray-50/20 transition-colors">
//                     <td className="px-8 py-6">
//                       <div className="flex items-center gap-4">
//                         <div className="w-12 h-12 bg-[#002B5B] rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-300">
//                           <StoreIcon size={20} />
//                         </div>
//                         <div>
//                           <p className="font-black text-[#1E1E1E] leading-none mb-1">{vendor.storeName}</p>
//                           <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
//                             <Mail size={12} className="text-[#F7931E]" /> {vendor.user.email}
//                           </div>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-8 py-6">
//                       <div className="flex flex-col gap-1">
//                         {vendor.isSuspended ? (
//                           <Badge color="red" icon={<PauseCircle size={12}/>} text="Suspended" />
//                         ) : vendor.status === "APPROVED" ? (
//                           <Badge color="green" icon={<CheckCircle size={12}/>} text="Verified" />
//                         ) : vendor.status === "REJECTED" ? (
//                           <Badge color="gray" icon={<XCircle size={12}/>} text="Rejected" />
//                         ) : (
//                           <Badge color="amber" icon={<AlertCircle size={12}/>} text="Pending Review" />
//                         )}
//                       </div>
//                     </td>
//                     <td className="px-8 py-6">
//                       <div className="flex justify-end gap-2">
//                         <ActionButton 
//                           onClick={() => setSelectedVendor(vendor)}
//                           icon={<Eye size={18} />}
//                           variant="blue"
//                           title="Review Application & Docs"
//                         />
                        
//                         {!vendor.isSuspended && vendor.status === "APPROVED" && (
//                           <ActionButton 
//                             onClick={() => setEnforcementModal({ isOpen: true, vendor, action: "SUSPEND" })}
//                             loading={actionId === `${vendor.id}-SUSPEND`}
//                             icon={<PauseCircle size={18} />}
//                             variant="amber"
//                             title="Suspend Merchant"
//                           />
//                         )}
//                         {vendor.isSuspended && (
//                           <ActionButton 
//                             onClick={() => setEnforcementModal({ isOpen: true, vendor, action: "RESTORE" })}
//                             loading={actionId === `${vendor.id}-RESTORE`}
//                             icon={<RefreshCcw size={18} />}
//                             variant="blue"
//                             title="Restore Access"
//                           />
//                         )}
//                         <ActionButton 
//                           onClick={() => handleVendorAction(vendor.id, "DELETE")}
//                           loading={actionId === `${vendor.id}-DELETE`}
//                           icon={<Trash2 size={18} />}
//                           variant="red"
//                           title="Delete Permanently"
//                         />
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination Logic */}
//         {totalPages > 1 && (
//           <div className="p-6 border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
//             <p className="text-xs font-bold text-gray-400">
//               Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredVendors.length)} of {filteredVendors.length} vendors
//             </p>
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={() => dispatch(setCurrentPage(currentPage - 1))}
//                 disabled={currentPage === 1}
//                 className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 disabled:opacity-30 transition-all text-[#002B5B]"
//               >
//                 <ChevronLeft size={18} />
//               </button>
//               <span className="text-xs font-black px-3 py-1 bg-white border border-gray-200 rounded-md text-[#002B5B]">
//                 {currentPage} / {totalPages}
//               </span>
//               <button
//                 onClick={() => dispatch(setCurrentPage(currentPage + 1))}
//                 disabled={currentPage === totalPages}
//                 className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 disabled:opacity-30 transition-all text-[#002B5B]"
//               >
//                 <ChevronRight size={18} />
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

    

//         {/* REVIEW SIDEBAR */}
//         {selectedVendor && (
//           <div className="fixed top-0 right-0 h-full w-[400px] bg-white shadow-2xl border-l border-gray-100 z-50 animate-in slide-in-from-right duration-300">
//             <div className="p-6 h-full flex flex-col">
//               <div className="flex items-center justify-between mb-8">
//                 <h4 className="font-black text-[#002B5B] uppercase tracking-wider text-sm">Vendor Verification</h4>
//                 <button onClick={() => setSelectedVendor(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
//                   <X size={20} className="text-gray-400" />
//                 </button>
//               </div>

//               <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
//                 {/* DOCUMENT GALLERY SECTION */}
//                 <div className="space-y-6">
//                   {[
//                     { label: "Identity Proof", url: selectedVendor.identityDoc },
//                     { label: "Business Registration", url: selectedVendor.businessDoc },
//                     { label: "Location Proof", url: selectedVendor.locationDoc },
//                   ].map((doc, index) => (
//                     <div key={index}>
//                       <p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">{doc.label}</p>
//                       {doc.url ? (
//                         <div className="rounded-2xl overflow-hidden border-2 border-gray-50 shadow-sm bg-gray-50 group relative">
//                           <Image 
//                             src={doc.url} 
//                             alt={doc.label} 
//                             height={400}
//                             width={400}
//                             className="w-full h-48 object-cover cursor-pointer" 
//                           />
//                           <a href={doc.url} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white font-bold text-[10px] uppercase">
//                             View Fullscreen
//                           </a>
//                         </div>
//                       ) : (
//                         <div className="h-24 rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-300 italic text-[10px] text-center p-4">
//                           <ShieldAlert size={20} className="mb-1 opacity-20 text-red-500" />
//                           Missing Document
//                         </div>
//                       )}
//                     </div>
//                   ))}
//                 </div>

//                 <hr className="border-gray-50" />

//                 {/* BANKING & STORE INFO (Kept the same) */}
//                 <div className="bg-gray-50 rounded-3xl p-5 border border-gray-100 space-y-6">
//                   <div>
//                     <div className="flex items-center gap-2 text-[#002B5B] mb-3">
//                       <CreditCard size={14} />
//                       <span className="text-[10px] font-black uppercase tracking-widest">Payout Details</span>
//                     </div>
//                     {selectedVendor.bankName ? (
//                       <div className="space-y-1">
//                         <p className="text-sm font-black text-[#002B5B]">{selectedVendor.bankName}</p>
//                         <p className="text-xs font-mono font-bold text-gray-600">{selectedVendor.accountNumber}</p>
//                       </div>
//                     ) : <p className="text-xs font-bold text-gray-400 italic">No bank info provided.</p>}
//                   </div>
//                 </div>
//               </div>

//               <div className="pt-6 border-t border-gray-100 grid grid-cols-2 gap-3">
//                 <button 
//                   disabled={actionId !== null}
//                   onClick={() => handleVendorAction(selectedVendor.id, "REJECT")}
//                   className="py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-[10px] uppercase hover:bg-red-50 hover:text-red-600 transition-all disabled:opacity-50"
//                 >
//                   Reject
//                 </button>
//                 <button 
//                   disabled={actionId !== null || selectedVendor.status === "APPROVED"}
//                   onClick={() => handleVendorAction(selectedVendor.id, "APPROVE")}
//                   className="py-4 bg-[#F7931E] text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-[#F7931E]/20 hover:scale-[1.02] transition-all disabled:opacity-50"
//                 >
//                   {actionId?.includes("APPROVE") ? <Loader2 className="animate-spin mx-auto" size={16} /> : "Verify Merchant"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//        {/* ENFORCEMENT MODAL */}
//       {enforcementModal.isOpen && (
//         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#002B5B]/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
//           <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
//             <div className="flex items-center gap-4 mb-6">
//               <div className={`w-12 h-12 ${enforcementModal.action === "SUSPEND" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"} rounded-2xl flex items-center justify-center`}>
//                 {enforcementModal.action === "SUSPEND" ? <Octagon size={28} /> : <RotateCcw size={28} />}
//               </div>
//               <div>
//                 <h3 className="text-xl font-black text-[#002B5B] uppercase tracking-tight">Account Enforcement</h3>
//                 <p className="text-xs font-bold text-gray-400 uppercase">Target: {enforcementModal.vendor?.storeName}</p>
//               </div>
//             </div>

//             <textarea 
//               value={enforcementReason}
//               onChange={(e) => setEnforcementReason(e.target.value)}
//               placeholder="State the violation or reason for restoration..."
//               className="w-full h-32 bg-gray-50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-[#F7931E] mb-6 transition-all"
//             />

//             <div className="grid grid-cols-2 gap-3">
//               <button 
//                 onClick={() => setEnforcementModal({ isOpen: false, vendor: null, action: null })}
//                 className="py-4 bg-gray-100 text-gray-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-200 transition-all"
//               >
//                 Cancel
//               </button>
//               <button 
//                 onClick={handleEnforcement}
//                 disabled={actionId !== null}
//                 className={`flex items-center justify-center gap-2 py-4 ${enforcementModal.action === "SUSPEND" ? "bg-red-600" : "bg-[#002B5B]"} text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-md active:scale-95 disabled:opacity-50`}
//               >
//                 {actionId !== null ? <Loader2 size={16} className="animate-spin" /> : enforcementModal.action}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// function Badge({ color, icon, text }: { color: string, icon: React.ReactNode, text: string }) {
//   const colors: any = {
//     red: "bg-red-100 text-red-700 border-red-200",
//     green: "bg-green-50 text-green-700 border-green-100",
//     amber: "bg-amber-50 text-amber-700 border-amber-100",
//     gray: "bg-gray-100 text-gray-700 border-gray-200"
//   };
//   return (
//     <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase w-fit border ${colors[color]}`}>
//       {icon} {text}
//     </span>
//   );
// }

// function ActionButton({ onClick, loading, icon, variant, title }: any) {
//   const styles: any = {
//     green: "bg-green-600 text-white hover:bg-green-700",
//     amber: "bg-amber-500 text-white hover:bg-amber-600",
//     blue: "bg-[#002B5B] text-white hover:bg-[#003d82]",
//     gray: "bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200",
//     red: "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border-red-100"
//   };

//   return (
//     <button 
//       onClick={onClick} 
//       disabled={loading}
//       className={`p-2.5 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 border ${styles[variant]}`}
//       title={title}
//     >
//       {loading ? <Loader2 size={18} className="animate-spin" /> : icon}
//     </button>
//   );
//  }




"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  CheckCircle,
  Store as StoreIcon,
  Mail,
  Loader2,
  Search,
  AlertCircle,
  PauseCircle,
  Trash2,
  RefreshCcw,
  ShieldAlert,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Eye,
  CreditCard,
  Octagon,
  RotateCcw,
} from "lucide-react";
import { useNotification } from "@/app/_context/NotificationContext";
import type { AdminVendor, VerificationStatus } from "@/store/vendorSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  setAllVendors,
  updateVendorStatusInStore,
  setSearchQuery,
  setCurrentPage,
  setStatusFilter,
} from "@/store/vendorSlice";
import { Admin } from "@/types/admin";


type VendorWithUser = AdminVendor & {
  user: {
    name: string | null;
    email: string | null;
  };
};



const itemsPerPage = 10;

export default function AdminVendorManager() {
  const { notifyError, notifySuccess } = useNotification();
  const dispatch = useDispatch();

  const { vendors, searchQuery, statusFilter, currentPage } = useSelector(
    (state: RootState) => state.vendor
  );

  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<AdminVendor | null>(null);

  const [enforcementModal, setEnforcementModal] = useState<{
    isOpen: boolean;
    vendor: AdminVendor | null;
    action: "SUSPEND" | "RESTORE" | null;
  }>({
    isOpen: false,
    vendor: null,
    action: null,
  });

  const [enforcementReason, setEnforcementReason] = useState("");

  const filteredVendors = vendors.filter((v: AdminVendor) => {
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      v.id.toLowerCase().includes(query) ||
      v.storeName.toLowerCase().includes(query) ||
      v.user.name.toLowerCase().includes(query) ||
      v.user.email.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "ALL"
        ? true
        : statusFilter === "SUSPENDED"
        ? v.isSuspended
        : v.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVendors = filteredVendors.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);


  async function fetchVendors() {
    try {
      const res = await fetch("/api/admins/vendors");
      const data = await res.json();

      if (res.ok) {
        dispatch(setAllVendors(data.vendors));
      } else {
        notifyError(data.error || "Could not load vendors");
      }
    } catch {
      notifyError("Connection error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchVendors();
  }, []);

  async function handleVendorAction(
    vendorProfileId: string,
    action: "APPROVE" | "REJECT" | "DELETE"
  ) {
    if (action === "DELETE" && !confirm("Permanently delete this vendor?")) return;

    setActionId(`${vendorProfileId}-${action}`);

    try {
      const res = await fetch("/api/admins/vendors/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorProfileId, action }),
      });

      const data = await res.json();

      if (!res.ok) {
        notifyError(data.error || `Failed to ${action.toLowerCase()} vendor`);
        return;
      }

      if (action === "DELETE") {
        notifySuccess("Vendor deleted successfully");

        if (selectedVendor?.id === vendorProfileId) {
          setSelectedVendor(null);
        }

        await fetchVendors();
        return;
      }

     if (data.vendor) {
  dispatch(
    updateVendorStatusInStore({
      vendorProfileId: data.vendor.id, 
      status: data.vendor.status,
      isSuspended: data.vendor.isSuspended,
    })
  );
}

      notifySuccess(`Vendor ${action.toLowerCase()} successful`);

      if (selectedVendor?.id === vendorProfileId) {
        setSelectedVendor(data.vendor ?? null);
      }
    } catch {
      notifyError("Connection error");
    } finally {
      setActionId(null);
    }
  }

  async function handleEnforcement() {
    if (!enforcementReason.trim()) {
      notifyError("Reason Required: Please state why this action is being taken.");
      return;
    }

    const { vendor, action } = enforcementModal;
    if (!vendor || !action) return;

    setActionId(`${vendor.id}-${action}`);

    try {
      const res = await fetch("/api/admins/vendors/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorProfileId: vendor.id,
          action: action === "RESTORE" ? "UNSUSPEND" : "SUSPEND",
          reason: enforcementReason,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        notifyError(data.error || "Failed to update vendor");
        return;
      }

      dispatch(
        updateVendorStatusInStore({
          vendorProfileId: vendor.id,
          status: data.vendor?.status,
          isSuspended: data.vendor?.isSuspended,
        })
      );

      notifySuccess(
        `Vendor ${vendor.storeName} ${
          action === "SUSPEND" ? "suspended" : "restored"
        } successfully`
      );

      setEnforcementModal({ isOpen: false, vendor: null, action: null });
      setEnforcementReason("");

      if (selectedVendor?.id === vendor.id) {
        setSelectedVendor(data.vendor ?? null);
      }
    } catch {
      notifyError("Connection error");
    } finally {
      setActionId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-[#F7931E]" size={40} />
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        className={`bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden transition-all duration-500 ${
          selectedVendor ? "mr-[400px]" : "mr-0"
        }`}
      >
        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between gap-4 bg-white">
          <div>
            <h3 className="text-xl font-black text-[#002B5B]">Merchant Control Center</h3>
            <p className="text-sm font-bold text-gray-500 italic">
              Manage store verifications, suspensions, and access
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Filter
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={14}
              />
              <select
                value={statusFilter}
                onChange={(e) => dispatch(setStatusFilter(e.target.value as any))}
                className="pl-9 pr-4 py-2 bg-gray-50 rounded-xl text-xs font-black uppercase outline-none border-none focus:ring-2 focus:ring-[#F7931E]/20 text-[#002B5B] appearance-none cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Verified</option>
                <option value="REJECTED">Rejected</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>

            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                placeholder="Search ID, Store or Name..."
                className="pl-10 pr-4 py-2 bg-gray-50 rounded-xl text-sm font-bold outline-none border-none focus:ring-2 focus:ring-[#F7931E]/20 w-full md:w-64"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50">
              <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                <th className="px-8 py-4">Vendor Details</th>
                <th className="px-8 py-4">Verification Status</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {currentVendors.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-8 py-12 text-center text-gray-400 font-bold italic"
                  >
                    No vendors found matching criteria.
                  </td>
                </tr>
              ) : (
                currentVendors.map((vendor: AdminVendor) => (
                  <tr key={vendor.id} className="group hover:bg-gray-50/20 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#002B5B] rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                          <StoreIcon size={20} />
                        </div>
                        <div>
                          <p className="font-black text-[#1E1E1E] leading-none mb-1">
                            {vendor.storeName}
                          </p>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                            <Mail size={12} className="text-[#F7931E]" /> {vendor.user.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        {vendor.isSuspended ? (
                          <Badge color="red" icon={<PauseCircle size={12} />} text="Suspended" />
                        ) : vendor.status === "APPROVED" ? (
                          <Badge color="green" icon={<CheckCircle size={12} />} text="Verified" />
                        ) : vendor.status === "REJECTED" ? (
                          <Badge color="gray" icon={<XCircle size={12} />} text="Rejected" />
                        ) : (
                          <Badge
                            color="amber"
                            icon={<AlertCircle size={12} />}
                            text="Pending Review"
                          />
                        )}
                      </div>
                    </td>

                    <td className="px-8 py-6">
                      <div className="flex justify-end gap-2">
                        <ActionButton
                          onClick={() => setSelectedVendor(vendor)}
                          icon={<Eye size={18} />}
                          variant="blue"
                          title="Review Application & Docs"
                        />

                        {!vendor.isSuspended && vendor.status === "APPROVED" && (
                          <ActionButton
                            onClick={() =>
                              setEnforcementModal({ isOpen: true, vendor, action: "SUSPEND" })
                            }
                            loading={actionId === `${vendor.id}-SUSPEND`}
                            icon={<PauseCircle size={18} />}
                            variant="amber"
                            title="Suspend Merchant"
                          />
                        )}

                        {vendor.isSuspended && (
                          <ActionButton
                            onClick={() =>
                              setEnforcementModal({ isOpen: true, vendor, action: "RESTORE" })
                            }
                            loading={actionId === `${vendor.id}-RESTORE`}
                            icon={<RefreshCcw size={18} />}
                            variant="blue"
                            title="Restore Access"
                          />
                        )}

                        <ActionButton
                          onClick={() => handleVendorAction(vendor.id, "DELETE")}
                          loading={actionId === `${vendor.id}-DELETE`}
                          icon={<Trash2 size={18} />}
                          variant="red"
                          title="Delete Permanently"
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-6 border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
            <p className="text-xs font-bold text-gray-400">
              Showing {indexOfFirstItem + 1} to{" "}
              {Math.min(indexOfLastItem, filteredVendors.length)} of {filteredVendors.length} vendors
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => dispatch(setCurrentPage(currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 disabled:opacity-30 transition-all text-[#002B5B]"
              >
                <ChevronLeft size={18} />
              </button>

              <span className="text-xs font-black px-3 py-1 bg-white border border-gray-200 rounded-md text-[#002B5B]">
                {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => dispatch(setCurrentPage(currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 disabled:opacity-30 transition-all text-[#002B5B]"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedVendor && (
        <div className="fixed top-0 right-0 h-full w-[400px] bg-white shadow-2xl border-l border-gray-100 z-50 animate-in slide-in-from-right duration-300">
          <div className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h4 className="font-black text-[#002B5B] uppercase tracking-wider text-sm">
                Vendor Verification
              </h4>
              <button
                onClick={() => setSelectedVendor(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
              <div className="space-y-6">
                {[
                  { label: "Identity Proof", url: selectedVendor.identityDoc },
                  { label: "Business Registration", url: selectedVendor.businessDoc },
                  { label: "Location Proof", url: selectedVendor.locationDoc },
                ].map((doc, index) => (
                  <div key={index}>
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">
                      {doc.label}
                    </p>

                    {doc.url ? (
                      <div className="rounded-2xl overflow-hidden border-2 border-gray-50 shadow-sm bg-gray-50 group relative">
                        <Image
                          src={doc.url}
                          alt={doc.label}
                          height={400}
                          width={400}
                          className="w-full h-48 object-cover cursor-pointer"
                        />
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white font-bold text-[10px] uppercase"
                        >
                          View Fullscreen
                        </a>
                      </div>
                    ) : (
                      <div className="h-24 rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-300 italic text-[10px] text-center p-4">
                        <ShieldAlert size={20} className="mb-1 opacity-20 text-red-500" />
                        Missing Document
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <hr className="border-gray-50" />

              <div className="bg-gray-50 rounded-3xl p-5 border border-gray-100 space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-[#002B5B] mb-3">
                    <CreditCard size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Payout Details
                    </span>
                  </div>

                  {selectedVendor.bankName ? (
                    <div className="space-y-1">
                      <p className="text-sm font-black text-[#002B5B]">
                        {selectedVendor.bankName}
                      </p>
                      <p className="text-xs font-mono font-bold text-gray-600">
                        {selectedVendor.accountNumber}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs font-bold text-gray-400 italic">
                      No bank info provided.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 grid grid-cols-2 gap-3">
              <button
                disabled={actionId !== null}
                onClick={() => handleVendorAction(selectedVendor.id, "REJECT")}
                className="py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-[10px] uppercase hover:bg-red-50 hover:text-red-600 transition-all disabled:opacity-50"
              >
                {actionId === `${selectedVendor.id}-REJECT` ? (
                  <Loader2 className="animate-spin mx-auto" size={16} />
                ) : (
                  "Reject"
                )}
              </button>

              <button
                disabled={actionId !== null || selectedVendor.status === "APPROVED"}
                onClick={() => handleVendorAction(selectedVendor.id, "APPROVE")}
                className="py-4 bg-[#F7931E] text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-[#F7931E]/20 hover:scale-[1.02] transition-all disabled:opacity-50"
              >
                {actionId === `${selectedVendor.id}-APPROVE` ? (
                  <Loader2 className="animate-spin mx-auto" size={16} />
                ) : (
                  "Verify Merchant"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {enforcementModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#002B5B]/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 mb-6">
              <div
                className={`w-12 h-12 ${
                  enforcementModal.action === "SUSPEND"
                    ? "bg-red-100 text-red-600"
                    : "bg-green-100 text-green-600"
                } rounded-2xl flex items-center justify-center`}
              >
                {enforcementModal.action === "SUSPEND" ? (
                  <Octagon size={28} />
                ) : (
                  <RotateCcw size={28} />
                )}
              </div>

              <div>
                <h3 className="text-xl font-black text-[#002B5B] uppercase tracking-tight">
                  Account Enforcement
                </h3>
                <p className="text-xs font-bold text-gray-400 uppercase">
                  Target: {enforcementModal.vendor?.storeName}
                </p>
              </div>
            </div>

            <textarea
              value={enforcementReason}
              onChange={(e) => setEnforcementReason(e.target.value)}
              placeholder="State the violation or reason for restoration..."
              className="w-full h-32 bg-gray-50 border-none rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-[#F7931E] mb-6 transition-all"
            />

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setEnforcementModal({ isOpen: false, vendor: null, action: null });
                  setEnforcementReason("");
                }}
                className="py-4 bg-gray-100 text-gray-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>

              <button
                onClick={handleEnforcement}
                disabled={actionId !== null}
                className={`flex items-center justify-center gap-2 py-4 ${
                  enforcementModal.action === "SUSPEND" ? "bg-red-600" : "bg-[#002B5B]"
                } text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-md active:scale-95 disabled:opacity-50`}
              >
                {actionId !== null ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : enforcementModal.action}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Badge({
  color,
  icon,
  text,
}: {
  color: string;
  icon: React.ReactNode;
  text: string;
}) {
  const colors: Record<string, string> = {
    red: "bg-red-100 text-red-700 border-red-200",
    green: "bg-green-50 text-green-700 border-green-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    gray: "bg-gray-100 text-gray-700 border-gray-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase w-fit border ${colors[color]}`}
    >
      {icon} {text}
    </span>
  );
}

function ActionButton({
  onClick,
  loading,
  icon,
  variant,
  title,
}: {
  onClick: () => void;
  loading?: boolean;
  icon: React.ReactNode;
  variant: "green" | "amber" | "blue" | "gray" | "red";
  title: string;
}) {
  const styles: Record<string, string> = {
    green: "bg-green-600 text-white hover:bg-green-700",
    amber: "bg-amber-500 text-white hover:bg-amber-600",
    blue: "bg-[#002B5B] text-white hover:bg-[#003d82]",
    gray: "bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200",
    red: "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border-red-100",
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`p-2.5 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 border ${styles[variant]}`}
      title={title}
    >
      {loading ? <Loader2 size={18} className="animate-spin" /> : icon}
    </button>
  );
}