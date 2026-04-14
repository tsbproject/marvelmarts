



"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Send, CheckCircle2, ArrowLeft, Loader2, ShieldCheck, Mail, Info } from "lucide-react";
import Link from "next/link";
import { useLoadingOverlay } from "@/app/_context/LoadingOverlayContext";
import { useNotification } from "@/app/_context/NotificationContext";

function ContactForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setLoading: setGlobalLoading } = useLoadingOverlay();
  const { notifyError, notifySuccess } = useNotification();
  
  // URL Context logic
  const articleRef = searchParams.get("ref");
  const defaultSubject = searchParams.get("subject") || "";

  // State Management
  const [localLoading, setLocalLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [honeypot, setHoneypot] = useState(""); // BOT DEFENSE

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // 1. SECURITY: Honeypot Validation
    if (honeypot.length > 0) {
      console.warn("Bot detected via honeypot.");
      setSubmitted(true); // Silently succeed to confuse the bot
      return;
    }

    setLocalLoading(true);
    setGlobalLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get("email"),
      subject: formData.get("subject"),
      message: formData.get("message"),
      articleId: articleRef,
      // Pass honeypot to server for secondary check if needed
      security_gate: honeypot 
    };

    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setSubmitted(true);
        notifySuccess("Ticket generated successfully. Protocol initiated.");
      } else {
        const errData = await res.text();
        throw new Error(errData || "Failed to transmit ticket.");
      }
    } catch (error: any) {
      notifyError(error.message || "Network disturbance detected. Please retry.");
    } finally {
      setLocalLoading(false);
      setGlobalLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-20 animate-in fade-in zoom-in duration-500 max-w-xl mx-auto">
        <div className="inline-flex p-6 bg-[#F7931E]/10 text-[#F7931E] rounded-[2.5rem] mb-8 shadow-inner">
          <CheckCircle2 size={64} strokeWidth={2.5} />
        </div>
        <h1 className="text-5xl font-black text-[#002B5B] mb-6 uppercase tracking-tighter">Message Received.</h1>
        <p className="text-neutral-500 max-w-md mx-auto mb-10 font-medium leading-relaxed">
          Your complaint has been logged in our system. Our support officers usually respond within <span className="text-[#002B5B] font-bold">24 duty hours</span>.
        </p>
        <button 
          onClick={() => router.push("/support")}
          className="bg-[#002B5B] text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95"
        >
          Return to HQ
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-12 items-start">
      {/* Sidebar Info */}
      <div className="lg:w-1/3 space-y-8">
        <div>
          <Link href="/support" className="inline-flex items-center gap-2 text-[10px] font-black text-[#F7931E] uppercase tracking-[0.3em] mb-8 hover:translate-x-[-4px] transition-transform">
            <ArrowLeft size={16} /> Secure Terminal
          </Link>
          <h1 className="text-4xl font-black text-[#002B5B] uppercase tracking-tighter mb-4 leading-none">
            Ticket <br /><span className="text-[#F7931E]">Submission.</span>
          </h1>
          <p className="text-neutral-500 font-medium leading-relaxed">
            Have a critical issue? Log a formal ticket in our encrypted queue.
          </p>
        </div>

        <div className="p-6 bg-white rounded-[2rem] border border-neutral-100 shadow-sm space-y-4">
          <div className="flex gap-4">
            <ShieldCheck className="text-[#002B5B] shrink-0" size={20} />
            <p className="text-[11px] font-bold text-neutral-400 uppercase leading-tight">End-to-end encryption active</p>
          </div>
          <div className="flex gap-4">
            <Mail className="text-[#002B5B] shrink-0" size={20} />
            <p className="text-[11px] font-bold text-neutral-400 uppercase leading-tight">Direct Admin response</p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="flex-1 w-full bg-white border border-neutral-100 p-10 rounded-[40px] shadow-2xl shadow-blue-900/5 space-y-8">
        
        {/* HONEYPOT FIELD - Hidden from Humans */}
        <div className="hidden" aria-hidden="true">
          <input 
            type="text" 
            name="marvel_security_confirm" 
            value={honeypot} 
            onChange={(e) => setHoneypot(e.target.value)} 
            tabIndex={-1} 
            autoComplete="off" 
          />
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase text-neutral-400 ml-1 tracking-widest">Authentication Email</label>
            <input 
              required 
              type="email" 
              name="email"
              placeholder="enter email address..."
              className="w-full p-5 bg-neutral-50 border-none rounded-2xl focus:ring-2 focus:ring-[#002B5B]/10 focus:bg-white outline-none font-bold text-[#002B5B] transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase text-neutral-400 ml-1 tracking-widest">Subject Reference</label>
            <input 
              required 
              type="text" 
              name="subject"
              defaultValue={defaultSubject}
              placeholder="e.g. order dispute - Order #number"
              className="w-full p-5 bg-neutral-50 border-none rounded-2xl focus:ring-2 focus:ring-[#002B5B]/10 focus:bg-white outline-none font-bold text-[#002B5B] transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase text-neutral-400 ml-1 tracking-widest">Your Message in detail</label>
            <textarea 
              required 
              name="message"
              rows={6}
              placeholder="Provide a detailed breakdown of your request..."
              className="w-full p-5 bg-neutral-50 border-none rounded-2xl focus:ring-2 focus:ring-[#002B5B]/10 focus:bg-white outline-none font-medium text-[#002B5B] transition-all resize-none"
            />
          </div>
        </div>

        <button 
          disabled={localLoading}
          type="submit"
          className="w-full flex items-center justify-center gap-3 bg-[#002B5B] text-white p-6 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-[#F7931E] hover:shadow-orange-200 transition-all shadow-xl shadow-blue-100 disabled:opacity-50"
        >
          {localLoading ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Submit Ticket</>}
        </button>

        <div className="flex items-center gap-2 justify-center py-2 opacity-30">
          <Info size={12} />
          <span className="text-[9px] font-black uppercase tracking-tighter text-[#002B5B]">Protocol 4.0 Secure Submission</span>
        </div>
      </form>
    </div>
  );
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#FBFBFB] pt-32 pb-20 px-6">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center p-20 gap-4">
          <Loader2 className="animate-spin text-[#002B5B]" size={40} />
          <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Booting Form...</p>
        </div>
      }>
        <ContactForm />
      </Suspense>
    </div>
  );
}