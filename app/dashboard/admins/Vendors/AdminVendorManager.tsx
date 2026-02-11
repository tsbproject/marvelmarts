"use client";

import React, { useState, useEffect } from "react";
import { 
  CheckCircle, 
  XCircle, 
  Store, 
  Mail, 
  MapPin, 
  Loader2,
  Search,
  ExternalLink
} from "lucide-react";
import { useNotification } from "@/app/_context/NotificationContext";

interface Vendor {
  id: string;
  storeName: string;
  storePhone: string;
  state: string;
  isVerified: boolean;
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

  // Load all vendors from the plural 'admins' API
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

  // Merged Approve/Reject Handler [2026-02-08]
  async function handleStatusUpdate(vendorId: string, status: "APPROVED" | "REJECTED") {
    setActionId(vendorId);
    try {
      const res = await fetch("/api/admins/vendors/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendorId, status }),
      });

      const data = await res.json();

      if (res.ok) {
        notifySuccess(data.message);
        // Update UI state locally
        setVendors(prev => prev.map(v => 
          v.id === vendorId ? { ...v, isVerified: status === "APPROVED" } : v
        ));
      } else {
        notifyError(data.error || "Update failed");
      }
    } catch (err) {
      notifyError("Server error");
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
      <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-[#002B5B]">Registered Vendors</h3>
          <p className="text-sm font-bold text-gray-500">Manage store verifications and access</p>
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
        <table className="w-full text-left">
          <thead className="bg-gray-50/50">
            <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              <th className="px-8 py-4">Store Details</th>
              <th className="px-8 py-4">Location</th>
              <th className="px-8 py-4">Status</th>
              <th className="px-8 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {vendors.map((vendor) => (
              <tr key={vendor.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#002B5B] rounded-xl flex items-center justify-center text-white shadow-inner">
                      <Store size={18} />
                    </div>
                    <div>
                      <p className="font-black text-[#1E1E1E]">{vendor.storeName}</p>
                      <p className="text-xs font-bold text-gray-400">{vendor.user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-1 text-xs font-black text-gray-500 uppercase">
                    <MapPin size={14} className="text-[#F7931E]" />
                    {vendor.state}
                  </div>
                </td>
                <td className="px-8 py-6">
                  {vendor.isVerified ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-black uppercase">
                      <CheckCircle size={10} /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-black uppercase">
                      Pending
                    </span>
                  )}
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2">
                    {!vendor.isVerified ? (
                      <button 
                        onClick={() => handleStatusUpdate(vendor.id, "APPROVED")}
                        disabled={actionId === vendor.id}
                        className="h-10 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2"
                      >
                        {actionId === vendor.id ? <Loader2 className="animate-spin" size={14} /> : "Approve"}
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleStatusUpdate(vendor.id, "REJECTED")}
                        disabled={actionId === vendor.id}
                        className="h-10 px-4 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-black uppercase transition-all"
                      >
                        {actionId === vendor.id ? <Loader2 className="animate-spin" size={14} /> : "Reject"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}