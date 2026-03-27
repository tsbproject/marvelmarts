"use client";

import { useState, useEffect } from "react";
import { useNotification } from "@/app/_context/NotificationContext";
import { Landmark, ShieldCheck, Save, Loader2 } from "lucide-react";

export default function BankDetailsPage() {
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { notifySuccess, notifyError } = useNotification();
  
  const [formData, setFormData] = useState({
    bankName: "",
    accountNumber: "",
    accountName: "",
  });

  // Fetch existing details on load
  useEffect(() => {
    setLoading(true);
    fetch("/api/bank-details")
      .then(res => res.json())
      .then(data => {
        if (data) setFormData(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/bank-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) notifySuccess("Bank Details Secured!");
      else throw new Error();
    } catch (err) {
      notifyError("Failed to save details");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center animate-pulse font-black uppercase italic">Scanning Vault...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 md:p-10">
      <div className="bg-white rounded-[3rem] shadow-xl border-2 border-neutral-light overflow-hidden">
        <div className="bg-accent-navy p-8 text-white">
          <Landmark className="mb-2 text-brand-primary" size={32} />
          <h1 className="text-3xl font-black italic uppercase">Refund <span className="text-brand-primary">HQ</span></h1>
          <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Submit bank details for direct payouts</p>
        </div>

        <form onSubmit={handleSave} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase text-neutral-gray ml-2">Bank Name</label>
              <input 
                required
                value={formData.bankName}
                onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                placeholder="e.g. Zenith Bank" 
                className="w-full p-5 bg-neutral-light rounded-2xl outline-none focus:ring-2 ring-brand-primary font-bold" 
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-neutral-gray ml-2">Account Number</label>
              <input 
                required
                maxLength={10}
                value={formData.accountNumber}
                onChange={(e) => setFormData({...formData, accountNumber: e.target.value.replace(/\D/g, '')})}
                placeholder="0123456789" 
                className="w-full p-5 bg-neutral-light rounded-2xl outline-none focus:ring-2 ring-brand-primary font-black text-xl tracking-widest" 
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-neutral-gray ml-2">Account Name</label>
              <input 
                required
                value={formData.accountName}
                onChange={(e) => setFormData({...formData, accountName: e.target.value.toUpperCase()})}
                placeholder="Enter account name" 
                className="w-full p-5 bg-neutral-light rounded-2xl outline-none focus:ring-2 ring-brand-primary font-bold uppercase" 
              />
            </div>
          </div>

          <button 
            disabled={isSaving}
            className="w-full bg-brand-primary text-white py-6 rounded-[2rem] font-black uppercase italic shadow-lg hover:bg-accent-navy transition-all flex items-center justify-center gap-3"
          >
            {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Update Details</>}
          </button>

          <p className="text-[9px] text-center font-bold text-neutral-gray uppercase flex items-center justify-center gap-2">
            <ShieldCheck size={14} className="text-brand-primary" />
            Stored with MarvelMarts Military-Grade Encryption
          </p>
        </form>
      </div>
    </div>
  );
}