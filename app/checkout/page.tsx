



"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { clearCart } from "@/store/cartSlice";
import { useNotification } from "@/app/_context/NotificationContext";
import { MapPin, 
  ChevronDown, 
  ShieldCheck, 
  ChevronLeft, 
  Wallet, 
  Zap, CreditCard, Banknote, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { processWalletPurchase } from "@/app/_actions/wallet";


const QuickFundModal = dynamic(() => import("../account/customer/_components/QuickFundModal"), {
  ssr: false, // This is the magic line that stops the crash
  loading: () => <div className="hidden" /> // Or a spinner
});

const PaystackButton = dynamic(() => import("@/app/_components/PaystackWrapper"), {
  ssr: false,
  loading: () => <div className="w-full bg-neutral-gray/10 py-7 rounded-[2rem] animate-pulse" />,
});

export default function CheckoutPage() {
  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"CARD" | "WALLET" | "TRANSFER">("CARD");
  const [walletBalance, setWalletBalance] = useState(0);
  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  const { items } = useSelector((state: RootState) => state.cart);
  const { notifySuccess, notifyError } = useNotification();
  const { data: session, status } = useSession();
  const router = useRouter();
  const dispatch = useDispatch();

  const NIGERIAN_STATES = [
    "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
    "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe",
    "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
    "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
    "Taraba", "Yobe", "Zamfara"
  ];

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    streetAddress: "",
    apartment: "",
    city: "",
    state: "",
    country: "Nigeria",
    useDifferentShipping: false,
    shippingDetails: {
      firstName: "",
      lastName: "",
      streetAddress: "",
      city: "",
      state: "",
    }
  });

  // --- SECURITY: INPUT SANITIZATION ---
  const sanitizeInput = (val: string) => {
    return val.replace(/<[^>]*>?/gm, '').trim(); // Remove HTML tags and trim
  };

  // --- VALIDATION LOGIC ---
  const isFormValid = useMemo(() => {
    const { email, firstName, lastName, phone, streetAddress, city, state } = formData;
    const baseFields = email && firstName && lastName && phone && streetAddress && city && state;
    
    if (formData.useDifferentShipping) {
      const s = formData.shippingDetails;
      return baseFields && s.firstName && s.lastName && s.streetAddress && s.city && s.state;
    }
    return !!baseFields;
  }, [formData]);


  
  

          useEffect(() => {
            setMounted(true);
          }, []);

        useEffect(() => {
          if (status === "authenticated" && session?.user?.email) {
            fetch("/api/wallet")
              .then(async (res) => {
                if (!res.ok) {
                  const errorText = await res.text();
                  throw new Error(`Server responded with ${res.status}: ${errorText}`);
                }
                return res.json();
              })
              .then((data) => setWalletBalance(Number(data.balance || 0)))
              .catch((err) => {
                console.error("Wallet Sync Error:", err.message);
                setWalletBalance(0);
              });
          }
        }, [status, session]);
    
    
    
    useEffect(() => {
      if (status === "authenticated" && session?.user?.email) {
        setFormData((prev) => ({
          ...prev,
          email: prev.email || session.user.email || "",
          firstName: prev.firstName || session.user.name?.split(" ")[0] || "",
          lastName:
            prev.lastName ||
            session.user.name?.split(" ").slice(1).join(" ") ||
            "",
        }));
      }
    }, [status, session]);


    useEffect(() => {
      if (!mounted) return;
      if (status === "loading") return;

      if (status === "unauthenticated") {
        router.replace("/auth/sign-in?redirect=/checkout");
      }
    }, [mounted, status, router]);

    useEffect(() => {
      console.log("CHECKOUT STATUS:", status);
      console.log("CHECKOUT SESSION:", session);
    }, [status, session]);
          



// --- AUTO-FILL (GEOLOCATION) ---
  const handleGeolocation = useCallback(() => {
    if (!navigator.geolocation) return notifyError("Geolocation not supported");
    notifySuccess("Scanning Sector...");
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
        const data = await res.json();
        setFormData(prev => ({
          ...prev,
          city: data.address.city || data.address.town || "",
          state: data.address.state || "",
          streetAddress: data.address.road || prev.streetAddress
        }));
        notifySuccess("Coordinates Locked!");
      } catch (err) {
        notifyError("Signal lost. Please enter manually.");
      }
    });
  }, [notifyError, notifySuccess]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: sanitizeInput(value) }));
  };

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      shippingDetails: { ...prev.shippingDetails, [name]: sanitizeInput(value) } 
    }));
  };

  const subtotal = useMemo(() => items.reduce((acc, item) => acc + item.price * item.quantity, 0), [items]);
  const shippingFee = 2500;
  const grandTotal = subtotal + shippingFee;

 if (!mounted || status === "loading" || status === "unauthenticated") {
  return null;
}

  const handleFundingSuccess = async (amount: number) => {
  // 1. Keep modal open for a second so user sees the progress
  setIsProcessing(true); 

  try {
    const response = await fetch('/api/wallet/topup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount })
    });

    if (!response.ok) throw new Error("Database sync failed");

    const data = await response.json();
    
    // 2. Update Balance & Close Modal
    setWalletBalance(Number(data.balance || 0));
    setIsFundModalOpen(false); // Close the modal ONLY after DB confirmation
    notifySuccess(`Wallet Powered Up! New Balance: ₦${data.balance.toLocaleString()}`);
    
  } catch (err) {
    console.error("Sync Error:", err);
    notifyError("Payment confirmed, but balance sync failed. Please refresh.");
    // Even if it fails, we must stop the "rolling" loader
  } finally {
    setIsProcessing(false); 
    setIsInitializing(false); // Also reset the modal's internal loader
  }
};
  

return (
    <div className="bg-neutral-white min-h-screen pb-20 pt-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-7 space-y-10">
            {/* CONTACT INFO */}
            <section className="bg-white p-8 rounded-3xl border border-neutral-light shadow-sm">
              <h3 className="text-2xl font-black italic uppercase mb-6 text-accent-navy">Identity & Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input 
                  type="email" name="email" value={formData.email} onChange={handleInputChange} 
                  placeholder="Email Address *" required
                  className="md:col-span-2 p-5 bg-neutral-light rounded-2xl outline-none focus:border-brand-primary border border-transparent transition-all" 
                />
                <input 
                  type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} 
                  placeholder="First Name *" required
                  className="p-4 bg-neutral-light rounded-xl outline-none focus:border-brand-primary border border-transparent transition-all" 
                />
                <input 
                  type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} 
                  placeholder="Last Name *" required
                  className="p-4 bg-neutral-light rounded-xl outline-none focus:border-brand-primary border border-transparent transition-all" 
                />
                <input 
                  type="tel" name="phone" value={formData.phone} onChange={handleInputChange} 
                  placeholder="Phone Number *" required
                  className="md:col-span-2 p-4 bg-neutral-light rounded-xl outline-none focus:border-brand-primary border border-transparent transition-all" 
                />
              </div>
            </section>

            {/* BILLING ADDRESS */}
            <section className="bg-white p-8 rounded-3xl border border-neutral-light shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black italic uppercase text-accent-navy">Billing HQ</h3>
                <button type="button" onClick={handleGeolocation} className="flex items-center gap-2 text-xs font-black uppercase text-brand-primary border-2 border-brand-primary/20 px-4 py-2 rounded-xl hover:bg-brand-primary hover:text-white transition-all">
                  <MapPin size={16} /> Auto-fill
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input 
                  type="text" name="streetAddress" value={formData.streetAddress} onChange={handleInputChange} 
                  placeholder="Street Address *" required
                  className="md:col-span-2 p-4 bg-neutral-light rounded-xl outline-none focus:border-brand-primary border border-transparent" 
                />
                <input 
                  type="text" name="city" value={formData.city} onChange={handleInputChange} 
                  placeholder="City *" required
                  className="p-4 bg-neutral-light rounded-xl outline-none focus:border-brand-primary border border-transparent" 
                />
                <div className="relative">
                  <select name="state" value={formData.state} onChange={handleInputChange} className="w-full p-4 bg-neutral-light rounded-xl appearance-none font-bold outline-none focus:border-brand-primary border border-transparent" required>
                    <option value="">State *</option>
                    {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-gray" size={18} />
                </div>
              </div>
            </section>

            {/* ALTERNATIVE SHIPPING */}
            <section className="p-6 border-2 border-dashed border-neutral-light rounded-[2rem]">
              <label className="flex items-center gap-4 cursor-pointer group">
                <input type="checkbox" className="w-6 h-6 accent-brand-primary rounded" checked={formData.useDifferentShipping} onChange={(e) => setFormData({...formData, useDifferentShipping: e.target.checked})} />
                <span className="text-lg font-black uppercase italic text-accent-navy group-hover:text-brand-primary transition-colors">Ship to a different address?</span>
              </label>
              {formData.useDifferentShipping && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2">
                  <input type="text" name="firstName" value={formData.shippingDetails.firstName} onChange={handleShippingChange} placeholder="Receiver First Name *" className="p-4 bg-neutral-light rounded-xl" required />
                  <input type="text" name="lastName" value={formData.shippingDetails.lastName} onChange={handleShippingChange} placeholder="Receiver Last Name *" className="p-4 bg-neutral-light rounded-xl" required />
                  <input type="text" name="streetAddress" value={formData.shippingDetails.streetAddress} onChange={handleShippingChange} placeholder="Shipping Address *" className="md:col-span-2 p-4 bg-neutral-light rounded-xl" required />
                  <input type="text" name="city" value={formData.shippingDetails.city} onChange={handleShippingChange} placeholder="Shipping City *" className="p-4 bg-neutral-light rounded-xl" required />
                  <select name="state" value={formData.shippingDetails.state} onChange={handleShippingChange} className="p-4 bg-neutral-light rounded-xl font-bold" required>
                    <option value="">Shipping State *</option>
                    {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}
            </section>

            {/* PAYMENT SELECTOR */}
            <section className={`bg-white p-8 rounded-3xl border shadow-sm transition-all ${!isFormValid ? "opacity-50 grayscale pointer-events-none" : "border-brand-primary/20"}`}>
              <h3 className="text-2xl font-black italic uppercase mb-8 text-accent-navy text-center md:text-left">
                Payment Method {!isFormValid && <span className="text-[10px] text-red-500 block normal-case font-bold mt-1">(Complete billing to unlock)</span>}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <button onClick={() => setPaymentMethod("CARD")} className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === "CARD" ? "border-brand-primary bg-brand-primary/5 shadow-inner" : "border-neutral-light"}`}>
                  <CreditCard className={paymentMethod === "CARD" ? "text-brand-primary" : "text-neutral-gray"} />
                  <span className="text-[10px] font-black uppercase">Card / Bank</span>
                </button>
                <button onClick={() => setPaymentMethod("WALLET")} className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === "WALLET" ? "border-brand-primary bg-brand-primary/5 shadow-inner" : "border-neutral-light"}`}>
                  <Wallet className={paymentMethod === "WALLET" ? "text-brand-primary" : "text-neutral-gray"} />
                  <span className="text-[10px] font-black uppercase tracking-tight">Wallet (₦{walletBalance.toLocaleString()})</span>
                </button>
                <button onClick={() => setPaymentMethod("TRANSFER")} className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === "TRANSFER" ? "border-brand-primary bg-brand-primary/5 shadow-inner" : "border-neutral-light"}`}>
                  <Banknote className={paymentMethod === "TRANSFER" ? "text-brand-primary" : "text-neutral-gray"} />
                  <span className="text-[10px] font-black uppercase">Transfer</span>
                </button>

                {/* QUICKFUNDMODAL*/}
                      <QuickFundModal 
                        isOpen={isFundModalOpen} 
                        email={formData.email} // Pass the email here
                        onClose={() => setIsFundModalOpen(false)} 
                        onSuccess={handleFundingSuccess} 
                      />
            </div>

              

              {/* DYNAMIC BUTTONS SECTION */}
              <div className="mt-8">
                {paymentMethod === "CARD" && (
                <PaystackButton
                  formData={formData}
                  items={items}
                  subtotal={subtotal}
                  shipping={shippingFee}
                  total={grandTotal}
                  onClose={() => notifyError("Payment Cancelled")}
                />
                )}
                
                {paymentMethod === "WALLET" && (
                  <div className="space-y-4">
                    {walletBalance >= grandTotal ? (
                      <button 
                        onClick={() => setIsProcessing(true)} 
                        disabled={!isFormValid || isProcessing} 
                        className="w-full bg-brand-primary text-white py-6 rounded-[2rem] font-black uppercase italic shadow-xl hover:bg-accent-navy transition-all flex items-center justify-center gap-3 active:scale-95"
                      >
                        {isProcessing ? <Loader2 className="animate-spin" /> : <>Pay ₦{grandTotal.toLocaleString()} from Wallet</>}
                      </button>
                    ) : (
                      <button 
                        onClick={() => setIsFundModalOpen(true)}
                        className="w-full bg-accent-navy text-white py-6 rounded-[2rem] font-black uppercase italic shadow-xl hover:opacity-90 transition-all flex flex-col items-center justify-center group animate-pulse hover:animate-none"
                      >
                        <span className="text-[10px] opacity-70 font-bold uppercase mb-1">
                          Insufficient Balance (₦{walletBalance.toLocaleString()})
                        </span>
                        <span className="text-brand-primary flex items-center gap-2">
                          Top Up Wallet <Zap size={16} className="fill-current" />
                        </span>
                      </button>
                    )}
                    <p className="text-[9px] text-center font-bold text-neutral-gray uppercase">
                      <ShieldCheck size={12} className="inline mr-1 text-brand-primary" /> 
                      Secure Wallet Transaction encrypted by MarvelMarts
                    </p>
                  </div>
                )}

                {paymentMethod === "TRANSFER" && (
                   <div className="bg-neutral-light p-6 rounded-2xl text-center border-2 border-dashed border-neutral-200">
                     <p className="text-sm font-black text-brand-primary uppercase">ACCESS BANK: 0123456789</p>
                     <p className="text-[10px] font-bold text-neutral-gray uppercase mt-1 italic">Marvel Marts Global Limited</p>
                     <button className="mt-4 w-full bg-accent-navy text-white py-3 rounded-xl font-black uppercase text-xs">I have transferred</button>
                   </div>
                )}
              </div>
            </section>
          </div>

          
          
          
          {/* ORDER SUMMARY */}
          <div className="lg:col-span-5">
            <div className="bg-neutral-light rounded-[2.5rem] p-10 sticky top-24 border border-neutral-200 shadow-sm">
              <h2 className="text-3xl font-black italic uppercase mb-10 text-accent-navy border-b-2 border-neutral-200 pb-4">Order <span className="text-brand-primary">Summary</span></h2>
              <div className="space-y-6 max-h-[400px] overflow-y-auto custom-scrollbar pr-2 mb-8">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="relative w-16 h-16 bg-white rounded-xl shrink-0 shadow-sm border border-white">
                      <Image src={item.imageUrl || "/placeholder-product.png"} alt={item.title} fill className="object-contain p-2" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-black uppercase italic text-accent-navy leading-tight">{item.title}</h4>
                      <p className="text-[9px] font-bold text-neutral-gray uppercase mt-1">QTY: {item.quantity} | {item.variantName || "Standard"}</p>
                    </div>
                    <span className="font-black text-xs text-accent-navy italic">₦{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-neutral-200 pt-6 space-y-3">
                <div className="flex justify-between text-[10px] font-black text-neutral-gray uppercase"><span>Subtotal</span><span className="text-accent-navy">₦{subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between text-[10px] font-black text-neutral-gray uppercase"><span>Shipping</span><span className="text-accent-navy">₦{shippingFee.toLocaleString()}</span></div>
                <div className="flex justify-between items-center border-t-4 border-brand-primary pt-6 mt-6">
                  <span className="text-lg font-black uppercase italic text-accent-navy">Total</span>
                  <span className="text-2xl font-black text-brand-primary italic">₦{grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

