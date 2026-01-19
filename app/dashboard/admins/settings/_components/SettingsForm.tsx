"use client";

import { useNotification } from "@/app/_context/NotificationContext";
import { updateSiteSettings } from "@/app/lib/actions/settings";
import { Save, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      type="submit" 
      disabled={pending}
      className="bg-[#002B5B] text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-[#F7931E] hover:text-[#1E1E1E] transition-all flex items-center gap-3 active:scale-95 disabled:opacity-70"
    >
      {pending ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
      {pending ? "Saving..." : "Save Footer Changes"}
    </button>
  );
}

export default function SettingsForm({ settings }: { settings: any }) {
  // Add an empty object fallback or check if context exists
  const notificationContext = useNotification();
  
  async function clientAction(formData: FormData) {
    const result = await updateSiteSettings(formData);
    
    // Only call showNotification if the context is available
    if (notificationContext?.showNotification) {
      if (result.success) {
        notificationContext.showNotification(result.message, "success");
      } else {
        notificationContext.showNotification(result.message, "error");
      }
    } else {
      // Fallback: use window alert if context is missing
      alert(result.message);
    }
  }

  return (
    <form action={clientAction} className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border border-gray-100 space-y-8">
      <div>
        <label className="block text-xs font-black uppercase tracking-widest text-[#4B4B4B] mb-3">Footer Description</label>
        <textarea 
          name="footerDesc"
          defaultValue={settings?.footerDesc}
          className="w-full bg-[#F8F8F8] rounded-2xl p-4 border-2 border-transparent focus:border-[#F7931E] outline-none min-h-[120px] font-medium text-[#1E1E1E]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-[#4B4B4B] mb-3">Customer Hotline</label>
          <input 
            name="supportPhone"
            defaultValue={settings?.supportPhone}
            className="w-full bg-[#F8F8F8] rounded-xl p-4 border-2 border-transparent focus:border-[#F7931E] outline-none font-bold text-[#1E1E1E]"
          />
        </div>
        <div>
          <label className="block text-xs font-black uppercase tracking-widest text-[#4B4B4B] mb-3">Support Email</label>
          <input 
            name="supportEmail"
            defaultValue={settings?.supportEmail}
            className="w-full bg-[#F8F8F8] rounded-xl p-4 border-2 border-transparent focus:border-[#F7931E] outline-none font-bold text-[#1E1E1E]"
          />
        </div>
      </div>

      <SubmitButton />
    </form>
  );
}