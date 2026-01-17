"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Send, CheckCircle2, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

function ContactForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get context from URL if user came from a specific article
  const articleRef = searchParams.get("ref");
  const defaultSubject = searchParams.get("subject") || "";

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get("email"),
      subject: formData.get("subject"),
      message: formData.get("message"),
      articleId: articleRef,
    };

    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (res.ok) setSubmitted(true);
    } catch (error) {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-20 animate-in fade-in zoom-in duration-500">
        <div className="inline-flex p-4 bg-green-50 text-green-600 rounded-full mb-6">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-4 uppercase">Message Sent!</h1>
        <p className="text-gray-500 max-w-md mx-auto mb-10 font-medium">
          Our support team has received your request. We usually respond within 24 hours.
        </p>
        <button 
          onClick={() => router.push("/support")}
          className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all"
        >
          Back to Help Center
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-10">
        <Link href="/support" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 uppercase tracking-widest mb-6">
          <ArrowLeft size={16} /> Help Center
        </Link>
        <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tight mb-2">Contact Support</h1>
        <p className="text-gray-500 font-medium">Have a question? We're here to help you get the most out of MarvelMarts.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white border border-gray-100 p-8 rounded-[32px] shadow-sm">
        <div>
          <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Your Email</label>
          <input 
            required 
            type="email" 
            name="email"
            placeholder="name@example.com"
            className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
          />
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Subject</label>
          <input 
            required 
            type="text" 
            name="subject"
            defaultValue={defaultSubject}
            placeholder="How can we help?"
            className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
          />
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1">Message</label>
          <textarea 
            required 
            name="message"
            rows={5}
            placeholder="Describe your issue in detail..."
            className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
          />
        </div>

        <button 
          disabled={loading}
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white p-5 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Send Message</>}
        </button>
      </form>
    </div>
  );
}

// Wrapping in Suspense is required when using useSearchParams in Next.js
export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 py-20 px-4">
      <Suspense fallback={<div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600" /></div>}>
        <ContactForm />
      </Suspense>
    </div>
  );
}