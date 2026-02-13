// "use client";

// import React, { useState, useEffect } from "react";
// import { 
//   CheckCircle, 
//   Store, 
//   Mail, 
//   MapPin, 
//   Loader2,
//   Search,
//   AlertCircle,
//   PauseCircle,
//   Trash2,
//   RefreshCcw,
//   ShieldAlert
// } from "lucide-react";
// import { useNotification } from "@/app/_context/NotificationContext";

// // Updated Interface to include isSuspended
// interface Vendor {
//   id: string;
//   storeName: string;
//   storePhone: string;
//   state: string;
//   isVerified: boolean;
//   isSuspended: boolean; 
//   user: {
//     email: string;
//     name: string;
//   };
// }

// export default function AdminVendorManager() {
//   const { notifyError, notifySuccess } = useNotification();
//   const [vendors, setVendors] = useState<Vendor[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [actionId, setActionId] = useState<string | null>(null);

//   async function fetchVendors() {
//     try {
//       const res = await fetch("/api/admins/vendors");
//       const data = await res.json();
//       if (res.ok) setVendors(data.vendors);
//     } catch (err) {
//       notifyError("Connection error");
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => { fetchVendors(); }, []);

//   // Merged Handler for ALL actions [2026-02-11]
//   async function handleVendorAction(vendorId: string, action: "APPROVE" | "REJECT" | "SUSPEND" | "UNSUSPEND" | "DELETE") {
//     if (action === "DELETE" && !confirm("Permanently delete this vendor? This cannot be undone.")) return;
    
//     setActionId(`${vendorId}-${action}`);
//     try {
//       const res = await fetch("/api/admins/vendors/status", {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ vendorId, action }),
//       });

//       const data = await res.json();

//       if (res.ok) {
//         notifySuccess(data.message || `Action ${action} successful`);
//         if (action === "DELETE") {
//           setVendors(prev => prev.filter(v => v.id !== vendorId));
//         } else {
//           // Refresh list to get updated states from DB
//           fetchVendors();
//         }
//       } else {
//         notifyError(data.error || "Action failed");
//       }
//     } catch (err) {
//       notifyError("Server error");
//     } finally {
//       setActionId(null);
//     }
//   }

//   if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-[#F7931E]" size={40} /></div>;

//   return (
//     <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
//       <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between gap-4">
//         <h3 className="text-xl font-black text-[#002B5B]">Merchant Control Center</h3>
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
//           <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 bg-gray-50 rounded-xl text-sm font-bold outline-none border-none w-full md:w-64" />
//         </div>
//       </div>

//       <div className="overflow-x-auto">
//         <table className="w-full text-left">
//           <thead className="bg-gray-50/50">
//             <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
//               <th className="px-8 py-4">Vendor Info</th>
//               <th className="px-8 py-4">Status</th>
//               <th className="px-8 py-4 text-right">Management Actions</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-50">
//             {vendors.map((vendor) => (
//               <tr key={vendor.id} className="hover:bg-gray-50/20 transition-colors">
//                 <td className="px-8 py-6">
//                   <div className="flex items-center gap-3">
//                     <div className="w-10 h-10 bg-[#002B5B] rounded-xl flex items-center justify-center text-white"><Store size={18} /></div>
//                     <div>
//                       <p className="font-black text-[#1E1E1E]">{vendor.storeName}</p>
//                       <p className="text-xs font-bold text-gray-400">{vendor.user.email}</p>
//                     </div>
//                   </div>
//                 </td>
//                 <td className="px-8 py-6">
//                   <div className="flex flex-col gap-1">
//                     {vendor.isSuspended ? (
//                       <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-[9px] font-black uppercase w-fit">
//                         <PauseCircle size={10} /> Suspended
//                       </span>
//                     ) : vendor.isVerified ? (
//                       <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-[9px] font-black uppercase w-fit">
//                         <CheckCircle size={10} /> Verified
//                       </span>
//                     ) : (
//                       <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[9px] font-black uppercase w-fit">
//                         <AlertCircle size={10} /> Pending
//                       </span>
//                     )}
//                   </div>
//                 </td>
//                 <td className="px-8 py-6">
//                   <div className="flex justify-end gap-2">
//                     {/* Approve / Unsuspend Logic */}
//                     {!vendor.isVerified && (
//                       <button onClick={() => handleVendorAction(vendor.id, "APPROVE")} className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-sm" title="Approve">
//                         <CheckCircle size={16} />
//                       </button>
//                     )}

//                     {vendor.isVerified && !vendor.isSuspended && (
//                       <button onClick={() => handleVendorAction(vendor.id, "SUSPEND")} className="p-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all shadow-sm" title="Suspend">
//                         <PauseCircle size={16} />
//                       </button>
//                     )}

//                     {vendor.isSuspended && (
//                       <button onClick={() => handleVendorAction(vendor.id, "UNSUSPEND")} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm" title="Lift Suspension">
//                         <RefreshCcw size={16} />
//                       </button>
//                     )}

//                     {/* Reject / Reset for Re-apply */}
//                     {vendor.isVerified && (
//                       <button onClick={() => handleVendorAction(vendor.id, "REJECT")} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all" title="Reject/Revoke">
//                         <ShieldAlert size={16} />
//                       </button>
//                     )}

//                     {/* Delete Permanent */}
//                     <button onClick={() => handleVendorAction(vendor.id, "DELETE")} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all" title="Delete Permanent">
//                       <Trash2 size={16} />
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }




"use client";

import React, { useState, useEffect } from "react";
import { 
  CheckCircle, 
  Store, 
  Mail, 
  MapPin, 
  Loader2,
  Search,
  AlertCircle,
  PauseCircle,
  Trash2,
  RefreshCcw,
  ShieldAlert
} from "lucide-react";
import { useNotification } from "@/app/_context/NotificationContext";

// Updated Interface to include isSuspended and accurate nested user data
interface Vendor {
  id: string;
  storeName: string;
  storePhone: string;
  state: string;
  isVerified: boolean;
  isSuspended: boolean; 
  user: {
    email: string;
    name: string;
  };
}

export default function AdminVendorManager() {
  const { notifyError, notifySuccess } = useNotification();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  // Load all vendors
  async function fetchVendors() {
    try {
      const res = await fetch("/api/admins/vendors");
      const data = await res.json();
      if (res.ok) {
        setVendors(data.vendors);
      } else {
        notifyError(data.error || "Could not load vendors");
      }
    } catch (err) {
      notifyError("Connection error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { 
    fetchVendors(); 
  }, []);

  // Merged Handler for ALL actions [2026-02-11]
  async function handleVendorAction(vendorId: string, action: "APPROVE" | "REJECT" | "SUSPEND" | "UNSUSPEND" | "DELETE") {
    if (action === "DELETE" && !confirm("Permanently delete this vendor? This cannot be undone.")) return;
    
    // Set loading state for the specific button clicked
    setActionId(`${vendorId}-${action}`);
    
    try {
      const res = await fetch("/api/admins/vendors/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId, action }),
      });

      const data = await res.json();

      if (res.ok) {
        notifySuccess(data.message || `Action ${action.toLowerCase()} successful`);
        if (action === "DELETE") {
          setVendors(prev => prev.filter(v => v.id !== vendorId));
        } else {
          // Re-fetch to ensure UI perfectly matches DB state
          fetchVendors();
        }
      } else {
        notifyError(data.error || "Action failed");
      }
    } catch (err) {
      notifyError("Server error occurred");
    } finally {
      setActionId(null);
    }
  }

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="animate-spin text-[#F7931E]" size={40} />
    </div>
  );

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
      {/* Header with search */}
      <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between gap-4 bg-white">
        <div>
          <h3 className="text-xl font-black text-[#002B5B]">Merchant Control Center</h3>
          <p className="text-sm font-bold text-gray-500 italic">Manage store verifications, suspensions, and access</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search vendors..." 
            className="pl-10 pr-4 py-2 bg-gray-50 rounded-xl text-sm font-bold outline-none border-none focus:ring-2 focus:ring-[#F7931E]/20 w-full md:w-64" 
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/50">
            <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              <th className="px-8 py-4">Vendor Details</th>
              <th className="px-8 py-4">Auth Status</th>
              <th className="px-8 py-4 text-right">Management Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {vendors.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-8 py-12 text-center text-gray-400 font-bold italic">
                  No registered vendors found.
                </td>
              </tr>
            ) : (
              vendors.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-gray-50/20 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#002B5B] rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                        <Store size={20} />
                      </div>
                      <div>
                        <p className="font-black text-[#1E1E1E] leading-none mb-1">{vendor.storeName}</p>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                          <Mail size={12} className="text-[#F7931E]" />
                          {vendor.user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      {vendor.isSuspended ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-[9px] font-black uppercase w-fit border border-red-200">
                          <PauseCircle size={12} /> Suspended
                        </span>
                      ) : vendor.isVerified ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-[9px] font-black uppercase w-fit border border-green-100">
                          <CheckCircle size={12} /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-[9px] font-black uppercase w-fit border border-amber-100">
                          <AlertCircle size={12} /> Pending Review
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-end gap-2">
                      {/* Approve Action */}
                      {!vendor.isVerified && !vendor.isSuspended && (
                        <button 
                          onClick={() => handleVendorAction(vendor.id, "APPROVE")} 
                          disabled={actionId === `${vendor.id}-APPROVE`}
                          className="p-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50" 
                          title="Verify Merchant"
                        >
                          {actionId === `${vendor.id}-APPROVE` ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                        </button>
                      )}

                      {/* Suspend Action */}
                      {vendor.isVerified && !vendor.isSuspended && (
                        <button 
                          onClick={() => handleVendorAction(vendor.id, "SUSPEND")} 
                          disabled={actionId === `${vendor.id}-SUSPEND`}
                          className="p-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-all shadow-sm hover:shadow-md disabled:opacity-50" 
                          title="Suspend Merchant"
                        >
                          {actionId === `${vendor.id}-SUSPEND` ? <Loader2 size={18} className="animate-spin" /> : <PauseCircle size={18} />}
                        </button>
                      )}

                      {/* Unsuspend Action */}
                      {vendor.isSuspended && (
                        <button 
                          onClick={() => handleVendorAction(vendor.id, "UNSUSPEND")} 
                          disabled={actionId === `${vendor.id}-UNSUSPEND`}
                          className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50" 
                          title="Restore Access"
                        >
                          {actionId === `${vendor.id}-UNSUSPEND` ? <Loader2 size={18} className="animate-spin" /> : <RefreshCcw size={18} />}
                        </button>
                      )}

                      {/* Reject/Revoke Action */}
                      {vendor.isVerified && (
                        <button 
                          onClick={() => handleVendorAction(vendor.id, "REJECT")} 
                          disabled={actionId === `${vendor.id}-REJECT`}
                          className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all border border-gray-200 disabled:opacity-50" 
                          title="Revoke Verification"
                        >
                          {actionId === `${vendor.id}-REJECT` ? <Loader2 size={18} className="animate-spin" /> : <ShieldAlert size={18} />}
                        </button>
                      )}

                      {/* Permanent Delete */}
                      <button 
                        onClick={() => handleVendorAction(vendor.id, "DELETE")} 
                        disabled={actionId === `${vendor.id}-DELETE`}
                        className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all border border-red-100 disabled:opacity-50" 
                        title="Delete Permanently"
                      >
                        {actionId === `${vendor.id}-DELETE` ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
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