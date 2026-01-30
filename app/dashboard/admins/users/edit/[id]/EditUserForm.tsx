
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNotification } from "@/app/_context/NotificationContext";
import { Save, ArrowLeft, Loader2 } from "lucide-react";

export default function EditUserForm({ user }: { user: any }) {
  const router = useRouter();
  const { notifySuccess, notifyError } = useNotification(); 
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || "",
    email: user.email || "",
    role: user.role || "CUSTOMER",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/admins/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        notifySuccess("Marvel Success: User profile updated");
        router.push("/dashboard/admins/users");
        router.refresh();
      } else {
        throw new Error();
      }
    } catch (err) {
      notifyError("Update failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };


  // Inside your EditUserForm.tsx

const handleRestore = async () => {
  setLoading(true);
  try {
    const res = await fetch(`/api/admins/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isSuspended: false }), 
    });

    if (res.ok) {
      notifySuccess("Marvel Success: User access has been restored");
      router.refresh();
    }
  } catch (err) {
    notifyError("Failed to restore user access.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Full Name</label>
          <input 
            type="text"
            required
            className="w-full mt-1 px-5 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 font-bold"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div>
          <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Email Address</label>
          <input 
            type="email"
            required
            className="w-full mt-1 px-5 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 font-bold"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>

        <div>
          <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Security Role</label>
          <select 
            className="w-full mt-1 px-5 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-100 font-bold appearance-none cursor-pointer"
            value={formData.role}
            onChange={(e) => setFormData({...formData, role: e.target.value})}
          >
            <option value="CUSTOMER">CUSTOMER</option>
            <option value="VENDOR">VENDOR</option>
            <option value="ADMIN">ADMIN</option>
            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
          </select>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-6 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-[2] px-6 py-4 bg-[#002B5B] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-900 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Sync Updates
          </button>
        </div>
      </form>
    </div>
  );
}




