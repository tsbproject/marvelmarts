// // "use client";

// // import { useState, Suspense } from "react";
// // import { useSearchParams, useRouter } from "next/navigation";
// // import { Send, CheckCircle2, ArrowLeft, Loader2 } from "lucide-react";
// // import Link from "next/link";

// // function ContactForm() {
// //   const searchParams = useSearchParams();
// //   const router = useRouter();
  
// //   // Get context from URL if user came from a specific article
// //   const articleRef = searchParams.get("ref");
// //   const defaultSubject = searchParams.get("subject") || "";

// //   const [loading, setLoading] = useState(false);
// //   const [submitted, setSubmitted] = useState(false);

// //   async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
// //     e.preventDefault();
// //     setLoading(true);

// //     const formData = new FormData(e.currentTarget);
// //     const data = {
// //       email: formData.get("email"),
// //       subject: formData.get("subject"),
// //       message: formData.get("message"),
// //       articleId: articleRef,
// //     };

// //     try {
// //       const res = await fetch("/api/support/tickets", {
// //         method: "POST",
// //         body: JSON.stringify(data),
// //       });

// //       if (res.ok) setSubmitted(true);
// //     } catch (error) {
// //       alert("Something went wrong. Please try again.");
// //     } finally {
// //       setLoading(false);
// //     }
// //   }

// //   if (submitted) {
// //     return (
// //       <div className="text-center py-20 animate-in fade-in zoom-in duration-500">
// //         <div className="inline-flex p-4 bg-green-50 text-green-600 rounded-full mb-6">
// //           <CheckCircle2 size={48} />
// //         </div>
// //         <h1 className="text-4xl font-black text-gray-900 mb-4 uppercase">Message Sent!</h1>
// //         <p className="text-gray-500 max-w-md mx-auto mb-10 font-medium">
// //           Our support team has received your request. We usually respond within 24 hours.
// //         </p>
// //         <button 
// //           onClick={() => router.push("/support")}
// //           className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all"
// //         >
// //           Back to Help Center
// //         </button>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="max-w-2xl mx-auto">
// //       <div className="mb-10">
// //         <Link href="/support" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 uppercase tracking-widest mb-6">
// //           <ArrowLeft size={16} /> Help Center
// //         </Link>
// //         <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tight mb-2">Contact Support</h1>
// //         <p className="text-gray-500 font-medium">Have a question? We're here to help you get the most out of MarvelMarts.</p>
// //       </div>

// //       <form onSubmit={handleSubmit} className="space-y-6 bg-white border border-gray-100 p-8 rounded-[32px] shadow-sm">
// //         <div>
// //           <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Your Email</label>
// //           <input 
// //             required 
// //             type="email" 
// //             name="email"
// //             placeholder="name@example.com"
// //             className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
// //           />
// //         </div>

// //         <div>
// //           <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Subject</label>
// //           <input 
// //             required 
// //             type="text" 
// //             name="subject"
// //             defaultValue={defaultSubject}
// //             placeholder="How can we help?"
// //             className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
// //           />
// //         </div>

// //         <div>
// //           <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Message</label>
// //           <textarea 
// //             required 
// //             name="message"
// //             rows={5}
// //             placeholder="Describe your issue in detail..."
// //             className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
// //           />
// //         </div>

// //         <button 
// //           disabled={loading}
// //           type="submit"
// //           className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white p-5 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
// //         >
// //           {loading ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Send Message</>}
// //         </button>
// //       </form>
// //     </div>
// //   );
// // }

// // // Wrapping in Suspense is required when using useSearchParams in Next.js
// // export default function ContactPage() {
// //   return (
// //     <div className="min-h-screen bg-gray-50/50 py-20 px-4">
// //       <Suspense fallback={<div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600" /></div>}>
// //         <ContactForm />
// //       </Suspense>
// //     </div>
// //   );
// // }




// "use client";

// import { useState, Suspense } from "react";
// import { useSearchParams, useRouter } from "next/navigation";
// import { Send, CheckCircle2, ArrowLeft, Loader2, ShieldCheck, Mail, Info } from "lucide-react";
// import Link from "next/link";
// import { useLoadingOverlay } from "@/app/_context/LoadingOverlayContext";
// import { useNotification } from "@/app/_context/NotificationContext";

// function ContactForm() {
//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const { setLoading: setGlobalLoading } = useLoadingOverlay();
  
//   // Get context from URL if user came from a specific article
//   const articleRef = searchParams.get("ref");
//   const defaultSubject = searchParams.get("subject") || "";

//   const [localLoading, setLocalLoading] = useState(false);
//   const [submitted, setSubmitted] = useState(false);
//   const {notifyError, notifySuccess} = useNotification()

//   async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
//     e.preventDefault();
//     setLocalLoading(true);
//     setGlobalLoading(true);

//     const formData = new FormData(e.currentTarget);
//     const data = {
//       email: formData.get("email"),
//       subject: formData.get("subject"),
//       message: formData.get("message"),
//       articleId: articleRef,
//     };

//     try {
//       const res = await fetch("/api/support/tickets", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(data),
//       });

//       if (res.ok) {
//         setSubmitted(true);
//         notifySuccess("Ticket generated successfully. Protocol initiated.");
//       } else {
//         const errData = await res.text();
//         throw new Error(errData || "Failed to send ticket");
//       }
//     } catch (error: any) {
//       notifyError(error.message || "Network disturbance detected. Please retry.");
//     } finally {
//       setLocalLoading(false);
//       setGlobalLoading(false);
//     }
//   }

//   if (submitted) {
//     return (
//       <div className="text-center py-20 animate-in fade-in zoom-in duration-500 max-w-xl mx-auto">
//         <div className="inline-flex p-6 bg-[#F7931E]/10 text-[#F7931E] rounded-[2.5rem] mb-8 shadow-inner">
//           <CheckCircle2 size={64} strokeWidth={2.5} />
//         </div>
//         <h1 className="text-5xl font-black text-[#002B5B] mb-6 uppercase tracking-tighter">Protocol Received.</h1>
//         <p className="text-neutral-500 max-w-md mx-auto mb-10 font-medium leading-relaxed">
//           Your transmission has been logged in our secure database. Our support officers usually respond within <span className="text-[#002B5B] font-bold">24 duty hours</span>.
//         </p>
//         <button 
//           onClick={() => router.push("/support")}
//           className="bg-[#002B5B] text-white px-12 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95"
//         >
//           Return to HQ
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-4xl mx-auto flex flex-col lg:flex-row gap-12 items-start">
//       {/* Sidebar Info */}
//       <div className="lg:w-1/3 space-y-8">
//         <div>
//           <Link href="/support" className="inline-flex items-center gap-2 text-[10px] font-black text-[#F7931E] uppercase tracking-[0.3em] mb-8 hover:translate-x-[-4px] transition-transform">
//             <ArrowLeft size={16} /> Secure Terminal
//           </Link>
//           <h1 className="text-4xl font-black text-[#002B5B] uppercase tracking-tighter mb-4 leading-none">Ticket <br /><span className="text-[#F7931E]">Submission.</span></h1>
//           <p className="text-neutral-500 font-medium leading-relaxed">Have a critical issue? Log a formal ticket in our encrypted queue.</p>
//         </div>

//         <div className="p-6 bg-white rounded-[2rem] border border-neutral-100 shadow-sm space-y-4">
//           <div className="flex gap-4">
//             <ShieldCheck className="text-[#002B5B] shrink-0" size={20} />
//             <p className="text-[11px] font-bold text-neutral-400 uppercase leading-tight">End-to-end encryption active</p>
//           </div>
//           <div className="flex gap-4">
//             <Mail className="text-[#002B5B] shrink-0" size={20} />
//             <p className="text-[11px] font-bold text-neutral-400 uppercase leading-tight">Direct Admin response</p>
//           </div>
//         </div>
//       </div>

//       {/* Form Card */}
//       <form onSubmit={handleSubmit} className="flex-1 w-full bg-white border border-neutral-100 p-10 rounded-[40px] shadow-2xl shadow-blue-900/5 space-y-8">
//         <div className="grid grid-cols-1 gap-8">
//           <div className="space-y-2">
//             <label className="block text-[10px] font-black uppercase text-neutral-400 ml-1 tracking-widest">Authentication Email</label>
//             <div className="relative">
//                <input 
//                 required 
//                 type="email" 
//                 name="email"
//                 placeholder="identity@marvelmarts.com"
//                 className="w-full p-5 bg-neutral-50 border-none rounded-2xl focus:ring-2 focus:ring-[#002B5B]/10 focus:bg-white outline-none font-bold text-[#002B5B] transition-all"
//               />
//             </div>
//           </div>

//           <div className="space-y-2">
//             <label className="block text-[10px] font-black uppercase text-neutral-400 ml-1 tracking-widest">Subject Reference</label>
//             <input 
//               required 
//               type="text" 
//               name="subject"
//               defaultValue={defaultSubject}
//               placeholder="e.g. Escrow Dispute - Order #4421"
//               className="w-full p-5 bg-neutral-50 border-none rounded-2xl focus:ring-2 focus:ring-[#002B5B]/10 focus:bg-white outline-none font-bold text-[#002B5B] transition-all"
//             />
//           </div>

//           <div className="space-y-2">
//             <label className="block text-[10px] font-black uppercase text-neutral-400 ml-1 tracking-widest">Detailed Transmission</label>
//             <textarea 
//               required 
//               name="message"
//               rows={6}
//               placeholder="Provide a detailed breakdown of your request..."
//               className="w-full p-5 bg-neutral-50 border-none rounded-2xl focus:ring-2 focus:ring-[#002B5B]/10 focus:bg-white outline-none font-medium text-[#002B5B] transition-all resize-none"
//             />
//           </div>
//         </div>

//         <button 
//           disabled={localLoading}
//           type="submit"
//           className="w-full flex items-center justify-center gap-3 bg-[#002B5B] text-white p-6 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-[#F7931E] hover:shadow-orange-200 transition-all shadow-xl shadow-blue-100 disabled:opacity-50"
//         >
//           {localLoading ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Transmit Ticket</>}
//         </button>

//         <div className="flex items-center gap-2 justify-center py-2 opacity-30">
//           <Info size={12} />
//           <span className="text-[9px] font-black uppercase tracking-tighter">Protocol 4.0 Secure Submission</span>
//         </div>
//       </form>
//     </div>
//   );
// }

// export default function ContactPage() {
//   return (
//     <div className="min-h-screen bg-[#FBFBFB] pt-32 pb-20 px-6">
//       <Suspense fallback={
//         <div className="flex flex-col items-center justify-center p-20 gap-4">
//           <Loader2 className="animate-spin text-[#002B5B]" size={40} />
//           <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Booting Form...</p>
//         </div>
//       }>
//         <ContactForm />
//       </Suspense>
//     </div>
//   );
// }




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
        <h1 className="text-5xl font-black text-[#002B5B] mb-6 uppercase tracking-tighter">Protocol Received.</h1>
        <p className="text-neutral-500 max-w-md mx-auto mb-10 font-medium leading-relaxed">
          Your transmission has been logged in our secure database. Our support officers usually respond within <span className="text-[#002B5B] font-bold">24 duty hours</span>.
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
              placeholder="identity@marvelmarts.com"
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
              placeholder="e.g. Escrow Dispute - Order #4421"
              className="w-full p-5 bg-neutral-50 border-none rounded-2xl focus:ring-2 focus:ring-[#002B5B]/10 focus:bg-white outline-none font-bold text-[#002B5B] transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black uppercase text-neutral-400 ml-1 tracking-widest">Detailed Transmission</label>
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
          {localLoading ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Transmit Ticket</>}
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