"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  ShieldCheck, 
  Lock,
  ArrowRight,
  ExternalLink,
  MessageCircle 
} from "lucide-react";

interface FooterProps {
  settings?: {
    footerDesc?: string;
    supportPhone?: string;
    supportEmail?: string;
    footerLogo?: string;
    footerBodyFontSize?: number;
    footerHeadingFontSize?: number;
    showSocialIcons?: boolean;
    facebookUrl?: string;
    instagramUrl?: string;
    twitterUrl?: string;
    whatsappUrl?: string;
  } | null;
}

export default function Footer({ settings }: FooterProps) {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const brandDefaults = {
    footerDesc: "Africa's most trusted marketplace. We bridge the gap between premium global quality and local convenience.",
    supportPhone: "+234 800-MARVEL",
    supportEmail: "support@marvelmarts.com"
  };

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const handleSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    const formData = new FormData(e.currentTarget);
    const botCheck = formData.get("marvel_marts_bot_check");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        body: JSON.stringify({ 
          email,
          marvel_marts_bot_check: botCheck 
        }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Welcome to the Inner Circle!");
        setEmail("");
      } else {
        throw new Error(data.message || "Subscription failed");
      }
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message);
    }
  };

  return (
    <footer className="bg-accent-navy text-neutral-light pt-24 pb-12 border-t-8 border-[#F7931E]">
      <div className="max-w-[1440px] mx-auto px-6 ">
        
        {/* Newsletter Section */}
        <div className="bg-[#F7931E] rounded-[3rem] p-6 md:p-16 mb-24 xs:px-15 xxs:px-10 shadow-2xl shadow-orange-950/30 border-b-8 border-[#1E1E1E]/10">
          <div className="flex flex-col xl:flex-row items-center justify-between gap-12">
            <div className="max-w-4xl text-center xl:text-left">
              <h3 className="text-2xl md:text-5xl 2xl:text-5xl lg:text-6xl font-black uppercase tracking-tighter italic text-[#1E1E1E] leading-[0.9]">
                Get &nbsp; the &nbsp; <span className="text-white">Marvel</span> Advantage
              </h3>
              <p className="text-[#002B5B] font-extrabold mt-6 text-lg md:text-xl lg:text-2xl max-w-xl">
                Join 10,000+ shoppers receiving weekly flash sale alerts and exclusive vendor deals.
              </p>
            </div>
            
            <div className="w-full xl:w-auto">
              <form onSubmit={handleSubscribe} className="flex flex-col xl:flex-col 2xl:flex-col md:flex-row gap-4">
                <div style={{ display: 'none' }} aria-hidden="true">
                  <input type="text" name="marvel_marts_bot_check" tabIndex={-1} autoComplete="off" />
                </div>
                <input 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email" 
                  name="email"
                  placeholder="Enter your best email address" 
                  className="w-full md:w-[500px] bg-white rounded-2xl py-10 px-6 xxs:py-3 text-accent-navy text-sm outline-none shadow-xl font-bold placeholder:text-gray-400 focus:ring-4 focus:ring-[#002B5B]/20 transition-all"
                  required
                />
                <button 
                  disabled={status === "loading"} 
                  type="submit"
                  className="bg-[#002B5B] text-white px-12 py-6 xxs:py-2 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-[#1E1E1E] transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl disabled:opacity-70"
                >
                  {status === "loading" ? "Processing..." : "Join Now"} <ArrowRight size={24} />
                </button>
              </form>
              {message && (
                <p className={`mt-4 font-black text-center xl:text-left uppercase tracking-widest text-sm ${status === "success" ? "text-white" : "text-[#1E1E1E]"}`}>
                  {message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-24 mb-24">
          
          <div className="space-y-10 text-center sm:text-left">
            <Link href="/" className="inline-block">
              <Image 
                src={settings?.footerLogo || "/logo.png"} 
                alt="MarvelMarts Logo" 
                width={320} 
                height={100} 
                style={{ height: "auto" }}
                className="max-w-[100px]" 
              />
            </Link>
            <p className="text-neutral-white leading-relaxed font-medium">
              {settings?.footerDesc ?? brandDefaults.footerDesc}
            </p>
            <div className="flex justify-center sm:justify-start gap-6">
              {settings?.showSocialIcons && (
                <>
                  {settings.facebookUrl && (
                    <Link 
                      href={settings.facebookUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-white/10 p-4 rounded-2xl hover:bg-[#F7931E] hover:text-[#1E1E1E] transition-all scale-110"
                    >
                      <Facebook size={24} />
                    </Link>
                  )}
                  {settings.instagramUrl && (
                    <Link 
                      href={settings.instagramUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-white/10 p-4 rounded-2xl hover:bg-[#F7931E] hover:text-[#1E1E1E] transition-all scale-110"
                    >
                      <Instagram size={24} />
                    </Link>
                  )}
                  {settings.twitterUrl && (
                    <Link 
                      href={settings.twitterUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-white/10 p-4 rounded-2xl hover:bg-[#F7931E] hover:text-[#1E1E1E] transition-all scale-110"
                    >
                      <Twitter size={24} />
                    </Link>
                  )}
                  {settings.whatsappUrl && (
                    <Link 
                      href={settings.whatsappUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-white/10 p-4 rounded-2xl hover:bg-[#F7931E] hover:text-[#1E1E1E] transition-all scale-110"
                    >
                      <MessageCircle size={24} />
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="lg:pl-8 text-center sm:text-left">
            <h4 className="font-black uppercase text-brand-primary tracking-[0.4em] mb-10">
              Explore 
            </h4>
            <ul className="space-y-4 text-xs lg:text-sm font-bold text-blue-100/90">
              <li><Link href="/shop" className="hover:text-[#F7931E] transition-all">All Products</Link></li>
              <li><Link href="/vendors" className="hover:text-[#F7931E] transition-all">Top Vendors</Link></li>
              <li><Link href="/auth/register/vendor-registration" className="hover:text-[#F7931E] transition-all">Sell on MarvelMarts</Link></li>
              <li><Link href="/track-order" className="hover:text-[#F7931E] transition-all">Tracking Your Order</Link></li>
              <li><Link href="/about-us" className="hover:text-[#F7931E] transition-all">About MarvelMarts</Link></li>
            </ul>
          </div>

          <div className="text-center sm:text-left">
            <h4 className="font-black uppercase tracking-[0.4em] mb-10 text-brand-primary">
              Assistance
            </h4>
            <ul className="space-y-4 text-xs lg:text-sm font-bold text-blue-100/90">
              <li><Link href="/support" className="hover:text-[#F7931E] transition-all">Help Center</Link></li>
              <li><Link href="/return-policy" className="hover:text-[#F7931E] transition-all">Return Policy</Link></li>
              <li><Link href="/terms-and-conditions" className="hover:text-[#F7931E] transition-all">Terms & Condition</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-[#F7931E] transition-all">Privacy Policy</Link></li>
              <li><Link href="/data-deletion" className="hover:text-[#F7931E] transition-all">Data Deletion</Link></li>
              <li><Link href="/faqs" className="hover:text-[#F7931E] transition-all">FAQS</Link></li>
              <li><Link href="/support" className="hover:text-[#F7931E] transition-all">Live Chat</Link></li>
            </ul>
          </div>

          <div className="bg-white/5 border-2 border-white/10 p-10 rounded-[3rem] space-y-8 h-fit">
            <div className="flex items-center gap-4">
              <div className="bg-[#F7931E] p-3 rounded-xl text-[#002B5B]">
                <ShieldCheck size={25} />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#F7931E]">
                Buyer Protected
              </span>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                 <span className="text-xs uppercase tracking-[0.3em] text-brand-primary">Hotline</span>
                 {/* Aligned to 16px as requested */}
                 <span className="text-[16px] text-neutral-white font-bold tracking-tight">
                   {settings?.supportPhone ?? brandDefaults.supportPhone}
                 </span>
              </div>
              <div className="flex flex-col gap-1">
                 <span className="text-[12px] uppercase tracking-[0.3em] text-brand-primary">Email Support</span>
                 {/* Aligned to 16px as requested */}
                 <span className="text-[16px] text-neutral-white font-bold break-words tracking-tight">
                   {settings?.supportEmail ?? brandDefaults.supportEmail}
                 </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment & Legal & Credit */}
        <div className="pt-12 border-t-2 border-white/10 flex flex-col xl:flex-row justify-between items-center gap-12">
          <div className="flex flex-col gap-4 items-center xl:items-start text-center xl:text-left">
              <p className="text-xs md:text-sm text-blue-200/50 font-black uppercase tracking-[0.4em]">
                © {currentYear} MARVELMARTS MARKETPLACE NIGERIA. ALL RIGHTS RESERVED.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-6">
                <div className="flex items-center gap-3 text-xs text-blue-400 font-bold italic">
                  <Lock size={14} /> 256-bit SSL SECURE ENCRYPTED ENVIRONMENT
                </div>
                <div className="hidden sm:block w-1 h-1 bg-blue-500 rounded-full" />
                <Link 
                  href="https://tayobolarinwa.dev" 
                  target="_blank"
                  className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#F7931E] hover:text-white transition-colors"
                >
                  Architected by Tayo Bolarinwa <ExternalLink size={10} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6 lg:gap-10 items-center grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
            <img src="https://js.paystack.co/v2/packages/paystack-logo/dist/paystack-logo-white.svg" alt="Paystack" className="h-6 md:h-8 w-auto" />
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 100 20" className="h-5 md:h-6 fill-white"><path d="M5 0h4v20H5V0zm8 0h4v20h-4V0zm8 0h4v20h-4V0zm12 4h-4V0h4v4zm0 16h-4V6h4v14z" /></svg>
              <span className="font-black italic text-sm tracking-tighter text-white">FLUTTERWAVE</span>
            </div>
            <svg viewBox="0 0 24 18" className="h-8 md:h-10"><circle cx="7" cy="9" r="7" fill="#EB001B" /><circle cx="17" cy="9" r="7" fill="#F79E1B" fillOpacity="0.8" /></svg>
            <svg viewBox="0 0 24 8" className="h-6 md:h-7 fill-white"><path d="M12.5 0L10.2 8h2.3l2.3-8h-2.3zM18.8 0l-2.2 5.5L15.3 0h-2.4l3.1 8h2.3l4-8h-2.5zM4.7 0H0l.1.5C2.6 1.2 4.1 2.5 4.7 4.1L5.9 8h2.4L11.8 0H9.4L7.1 5.4 6.2 1C6.1.4 5.5 0 4.7 0z" /></svg>
            <div className="italic font-black text-xl tracking-tighter flex items-center"><span className="text-white">Ver</span><span className="text-[#F7931E]">ve</span></div>
          </div>
        </div>
      </div>
    </footer>
  );
}