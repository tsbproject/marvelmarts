import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import SignInForm from "@/app/_components/SignInForm";
import { 
  Eye, EyeOff, Mail, Lock, ArrowLeft, 
  Loader2, Facebook, CheckCircle2
} from "lucide-react";

export const dynamic = "force-dynamic"; 





export default function SignInPage() {
  return (
    <div className="min-h-screen flex bg-neutral-white font-sans">
      
      {/* LEFT SIDE: Brand Identity Sidebar */}
      <div className="hidden lg:flex lg:w-[40%] bg-accent-navy p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-primary/20 blur-[120px] rounded-full" />
        
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3">
            <Image 
              src="/logo.png" 
              alt="MarvelMarts Logo" 
              width={180} 
              height={50} 
              className="object-contain"
              priority
            />
          </Link>
        </div>

        <div className="relative z-10">
          <h2 className="text-5xl font-black text-white leading-[1.1] mb-8">
            One MarketPlace. <br />
            <span className="text-brand-primary">Infinite Possibilities.</span>
          </h2>
          
          <ul className="space-y-4">
            {['Premium Marketplace Access', 'Global Vendor Network', 'Priority User Support'].map((text) => (
              <li key={text} className="flex items-center gap-3 text-brand-light font-medium">
                <CheckCircle2 size={20} className="text-brand-primary" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 border-t border-white/10 pt-8 text-white/50 text-xs font-bold uppercase tracking-widest">
          MarvelMarts International © {new Date().getFullYear()}
        </div>
      </div>

      {/* RIGHT SIDE: Gateway */}
      <div className="w-full lg:w-[60%] flex items-center justify-center p-6 md:p-12 lg:p-24 bg-[#F8F8F8]">
        <Suspense fallback={<div className="animate-pulse text-accent-navy font-black">INITIALIZING GATEWAY...</div>}>
          
          <SignInForm />
        </Suspense>
      </div>
    </div>
  );
}


