// "use client";

// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import { useState, useEffect, useMemo } from "react";
// import { useSelector } from "react-redux";
// import { RootState } from "@/store";
// import { useNotification } from "@/app/_context/NotificationContext";
// import { MapPin, ChevronDown, ShieldCheck, ChevronLeft } from "lucide-react";
// import dynamic from "next/dynamic";
// import Image from "next/image";
// import Link from "next/link";

// // DYNAMIC IMPORT: Prevents SSR crash from Paystack library
// const PaystackButton = dynamic(() => import("@/app/_components/PaystackWrapper"), {
//   ssr: false,
//   loading: () => (
//     <div className="w-full bg-neutral-gray/20 text-neutral-gray py-7 rounded-[2rem] font-black uppercase text-center animate-pulse">
//       Loading Payment System...
//     </div>
//   ),
// });

// interface PaystackResponse {
//   reference: string;
//   trans?: string;
//   status?: string;
//   message?: string;
//   transaction: string;
// }

// export default function CheckoutPage() {
//   const [mounted, setMounted] = useState(false);
//   const { items } = useSelector((state: RootState) => state.cart);
//   const { notifySuccess, notifyError } = useNotification();
//   const { data: session, status } = useSession();
//   const router = useRouter();

//   const NIGERIAN_STATES = [
//     "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
//     "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe",
//     "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
//     "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
//     "Taraba", "Yobe", "Zamfara"
//   ];

//   const [formData, setFormData] = useState({
//     email: "",
//     firstName: "",
//     lastName: "",
//     streetAddress: "",
//     apartment: "",
//     city: "",
//     state: "",
//     country: "Nigeria",
//     orderNotes: "",
//     useDifferentShipping: false,
//     shippingDetails: {
//       firstName: "",
//       lastName: "",
//       streetAddress: "",
//       apartment: "",
//       city: "",
//       state: "",
//     }
//   });

//   // 1. Initial Mount
//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   // 2. Auth Guard & State Sync - Stabilized to prevent "Maximum update depth"
//   useEffect(() => {
//     if (status === "unauthenticated") {
//   notifyError("Please sign in to secure your loot!");
//   // The callbackUrl tells Next-Auth where to go AFTER successful login
//   router.push("/auth/sign-in?callbackUrl=/checkout"); 
//   return;
// }
    
//     // Only update formData if email is missing to avoid re-render loops
//     if (status === "authenticated" && session?.user?.email && !formData.email) {
//       setFormData(prev => ({ ...prev, email: session.user.email }));
//     }
//   }, [status, session?.user?.email, router, formData.email]); // notifyError removed to prevent loop

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       shippingDetails: { ...prev.shippingDetails, [name]: value }
//     }));
//   };

//   // Calculate Totals
//   const subtotal = useMemo(() => items.reduce((acc, item) => acc + item.price * item.quantity, 0), [items]);
//   const shippingFee = 2500;
//   const grandTotal = subtotal + shippingFee;

//   const handlePaymentSuccess = async (reference: any) => { // Changed from PaystackResponse to any
//   try {
//     // 1. Create the order first
//     const orderRes = await fetch("/api/orders", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         userId: session?.user?.id,
//         items,
//         subtotal,
//         shipping: shippingFee,
//         total: grandTotal,
//         billingDetails: formData,
//         paymentReference: reference.reference // Paystack returns the ref here
//       }),
//     });
//       const orderData = await orderRes.json();

//       // 2. Verify on server
//       const verifyRes = await fetch("/api/orders/verify", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ reference: reference.reference, orderId: orderData.orderId }),
//       });

//       if (verifyRes.ok) {
//         notifySuccess("Order Secured!");
//         router.push(`/order-success?orderId=${orderData.orderId}`);
//       }
//     } catch (err) {
//       notifyError("Order saved, but verification failed. Contact support.");
//     }
//   };

//   const handleGeolocation = () => {
//     if (!navigator.geolocation) return notifyError("Geolocation not supported");
//     notifySuccess("Fetching location...");
//     navigator.geolocation.getCurrentPosition(async (pos) => {
//       try {
//         const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
//         const data = await res.json();
//         setFormData(prev => ({
//           ...prev,
//           city: data.address.city || data.address.town || "",
//           state: data.address.state || "",
//           streetAddress: data.address.road || prev.streetAddress
//         }));
//         notifySuccess("Location detected!");
//       } catch (err) {
//         notifyError("Could not fetch address details");
//       }
//     });
//   };

//   // Prevent hydration/SSR errors
//   if (!mounted || status === "loading") {
//     return (
//       <div className="min-h-screen animate-pulse bg-neutral-light flex items-center justify-center text-accent-navy font-black italic uppercase">
//         Verifying Identity...
//       </div>
//     );
//   }

//   return (
//     <div className="bg-neutral-white min-h-screen pb-20">
//       <div className="container mx-auto px-4 py-12">
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
//           <div className="lg:col-span-7 space-y-10">
//             <Link href="/cart" className="flex items-center gap-2 text-sm font-black uppercase text-neutral-gray hover:text-brand-primary transition-colors">
//               <ChevronLeft size={18} /> Edit Stash
//             </Link>

//             <div className="space-y-10">
//               {/* 1. CONTACT INFO */}
//               <section className="bg-white p-8 rounded-3xl border border-neutral-light shadow-sm">
//                 <h3 className="text-2xl font-black italic uppercase mb-6 text-accent-navy">Contact Info</h3>
//                 <input 
//                   type="email" name="email" value={formData.email} onChange={handleInputChange}
//                   placeholder="Email Address" 
//                   className="w-full p-5 bg-neutral-light rounded-2xl outline-none border border-transparent focus:border-brand-primary transition-all text-lg"
//                   required
//                 />
//               </section>

//               {/* 2. BILLING ADDRESS */}
//               <section className="bg-white p-8 rounded-3xl border border-neutral-light shadow-sm">
//                 <div className="flex justify-between items-center mb-8">
//                   <h3 className="text-2xl font-black italic uppercase text-accent-navy">Billing Address</h3>
//                   <button type="button" onClick={handleGeolocation} className="flex items-center gap-2 text-xs font-black uppercase text-brand-primary border-2 border-brand-primary/20 px-4 py-2 rounded-xl hover:bg-brand-primary hover:text-white transition-all">
//                     <MapPin size={16} /> Auto-fill
//                   </button>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="First Name *" className="p-4 bg-neutral-light rounded-xl text-lg outline-none border border-transparent focus:border-brand-primary" required />
//                   <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Last Name *" className="p-4 bg-neutral-light rounded-xl text-lg outline-none border border-transparent focus:border-brand-primary" required />
//                   <input type="text" name="streetAddress" value={formData.streetAddress} onChange={handleInputChange} placeholder="Street Address *" className="md:col-span-2 p-4 bg-neutral-light rounded-xl text-lg outline-none border border-transparent focus:border-brand-primary" required />
//                   <input type="text" name="apartment" value={formData.apartment} onChange={handleInputChange} placeholder="Apartment, suite, etc. (optional)" className="md:col-span-2 p-4 bg-neutral-light rounded-xl text-lg outline-none border border-transparent focus:border-brand-primary" />
//                   <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="Town / City *" className="p-4 bg-neutral-light rounded-xl text-lg outline-none border border-transparent focus:border-brand-primary" required />
//                   <div className="relative">
//                     <select name="state" value={formData.state} onChange={handleInputChange} className="w-full p-4 bg-neutral-light rounded-xl text-lg outline-none border border-transparent focus:border-brand-primary appearance-none font-bold text-accent-navy" required>
//                       <option value="">Select State *</option>
//                       {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
//                     </select>
//                     <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-gray pointer-events-none" size={20} />
//                   </div>
//                 </div>
//               </section>

//               {/* 3. SHIPPING ADDRESS */}
//               <section className="p-6 border-2 border-dashed border-neutral-light rounded-[2rem]">
//                 <label className="flex items-center gap-4 cursor-pointer group">
//                   <input 
//                     type="checkbox" 
//                     className="w-6 h-6 accent-brand-primary rounded" 
//                     checked={formData.useDifferentShipping}
//                     onChange={(e) => setFormData({...formData, useDifferentShipping: e.target.checked})}
//                   />
//                   <span className="text-lg font-black uppercase italic text-accent-navy group-hover:text-brand-primary transition-colors">Ship to a different address?</span>
//                 </label>
                
//                 {formData.useDifferentShipping && (
//                   <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
//                     <input type="text" name="firstName" value={formData.shippingDetails.firstName} onChange={handleShippingChange} placeholder="Receiver's First Name *" className="p-4 bg-neutral-light rounded-xl text-lg outline-none border border-transparent focus:border-brand-primary" required />
//                     <input type="text" name="lastName" value={formData.shippingDetails.lastName} onChange={handleShippingChange} placeholder="Receiver's Last Name *" className="p-4 bg-neutral-light rounded-xl text-lg outline-none border border-transparent focus:border-brand-primary" required />
//                     <input type="text" name="streetAddress" value={formData.shippingDetails.streetAddress} onChange={handleShippingChange} placeholder="Shipping Street Address *" className="md:col-span-2 p-4 bg-neutral-light rounded-xl text-lg outline-none border border-transparent focus:border-brand-primary" required />
//                     <input type="text" name="city" value={formData.shippingDetails.city} onChange={handleShippingChange} placeholder="Shipping City *" className="p-4 bg-neutral-light rounded-xl text-lg outline-none border border-transparent focus:border-brand-primary" required />
//                     <div className="relative">
//                       <select name="state" value={formData.shippingDetails.state} onChange={handleShippingChange} className="w-full p-4 bg-neutral-light rounded-xl text-lg outline-none border border-transparent focus:border-brand-primary appearance-none font-bold text-accent-navy" required>
//                         <option value="">Select Shipping State *</option>
//                         {NIGERIAN_STATES.map(s => <option key={`ship-${s}`} value={s}>{s}</option>)}
//                       </select>
//                       <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-gray pointer-events-none" size={20} />
//                     </div>
//                   </div>
//                 )}
//               </section>

//               {/* 4. PAYSTACK BUTTON (Dynamic) */}
//               <PaystackButton 
//                 email={formData.email || session?.user?.email || ""}
//                 amount={grandTotal}
//                 metadata={{
//                   ...formData,
//                   custom_fields: [
//                     { display_name: "Order Type", variable_name: "order_type", value: "checkout" }
//                   ]
//                 }}
//                 onSuccess={handlePaymentSuccess}
//                 onClose={() => notifyError("Loot acquisition aborted.")}
//               />
//             </div>
//           </div>

//           {/* RIGHT: Order Summary */}
//           <div className="lg:col-span-5">
//             <div className="bg-neutral-light rounded-[2.5rem] p-10 sticky top-24 border border-neutral-200 shadow-sm">
//               <h2 className="text-3xl font-black italic uppercase mb-10 text-accent-navy border-b-2 border-neutral-200 pb-4">Your <span className="text-brand-primary">Loot</span></h2>
              
//               <div className="space-y-8 max-h-[450px] overflow-y-auto pr-4 mb-10 custom-scrollbar">
//                 {items.map((item) => (
//                   <div key={`${item.id}-${item.variantId || 'base'}`} className="flex gap-6 items-center">
//                     <div className="relative w-24 h-24 bg-white rounded-2xl flex-shrink-0 shadow-sm overflow-hidden border border-white">
//                       <Image 
//                         src={(item.imageUrl && item.imageUrl !== "/images/placeholder.jpg") ? item.imageUrl : "/logo.png"} 
//                         alt={item.title} fill className="object-contain p-3" 
//                         sizes="96px"
//                       />
//                       <div className="absolute -top-1 -right-1 bg-brand-primary text-white text-[10px] w-7 h-7 rounded-full flex items-center justify-center font-black shadow-lg">
//                         {item.quantity}
//                       </div>
//                     </div>
//                     <div className="flex-1">
//                       <h4 className="text-lg font-black uppercase italic leading-tight text-accent-navy">{item.title}</h4>
//                       <p className="text-xs font-bold text-neutral-gray uppercase mt-1">{item.variantName || "Standard Gear"}</p>
//                     </div>
//                     <div className="text-right">
//                       <span className="font-black text-lg text-accent-navy italic">₦{(item.price * item.quantity).toLocaleString()}</span>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               <div className="space-y-4 mb-10 border-t border-neutral-200 pt-8">
//                 <div className="flex justify-between text-base font-bold uppercase tracking-widest text-neutral-gray">
//                   <span>Subtotal</span>
//                   <span className="text-accent-navy">₦{subtotal.toLocaleString()}</span>
//                 </div>
//                 <div className="flex justify-between text-base font-bold uppercase tracking-widest text-neutral-gray">
//                   <span>Shipping</span>
//                   <span className="text-accent-navy">₦{shippingFee.toLocaleString()}</span>
//                 </div>
//                 <div className="flex justify-between items-end border-t-4 border-brand-primary pt-6 mt-6">
//                   <span className="text-2xl font-black uppercase italic text-accent-navy">Total</span>
//                   <span className="text-4xl font-black text-brand-primary italic">₦{grandTotal.toLocaleString()}</span>
//                 </div>
//               </div>

//               <div className="bg-white/60 p-5 rounded-2xl flex items-center gap-5 border border-brand-primary/10">
//                 <ShieldCheck className="text-green-500" size={40} />
//                 <p className="text-xs font-bold uppercase text-neutral-gray leading-relaxed">Secure 256-bit encrypted checkout.</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { clearCart } from "@/store/cartSlice"; // Added this for post-payment cleanup
import { useNotification } from "@/app/_context/NotificationContext";
import { MapPin, ChevronDown, ShieldCheck, ChevronLeft } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";

// DYNAMIC IMPORT: Prevents SSR crash from Paystack library
const PaystackButton = dynamic(() => import("@/app/_components/PaystackWrapper"), {
  ssr: false,
  loading: () => (
    <div className="w-full bg-neutral-gray/20 text-neutral-gray py-7 rounded-[2rem] font-black uppercase text-center animate-pulse">
      Loading Payment System...
    </div>
  ),
});

export default function CheckoutPage() {
  const [mounted, setMounted] = useState(false);
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
    streetAddress: "",
    apartment: "",
    city: "",
    state: "",
    country: "Nigeria",
    orderNotes: "",
    useDifferentShipping: false,
    shippingDetails: {
      firstName: "",
      lastName: "",
      streetAddress: "",
      apartment: "",
      city: "",
      state: "",
    }
  });

  // 1. Initial Mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // 2. Auth Guard & State Sync
  useEffect(() => {
    if (mounted && status === "unauthenticated") {
      router.push("/auth/sign-in?callbackUrl=/checkout");
    }
    
    if (status === "authenticated" && session?.user?.email && !formData.email) {
      setFormData(prev => ({ ...prev, email: session.user.email }));
    }
  }, [status, session?.user?.email, router, formData.email, mounted]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      shippingDetails: { ...prev.shippingDetails, [name]: value }
    }));
  };

  // Totals
  const subtotal = useMemo(() => items.reduce((acc, item) => acc + item.price * item.quantity, 0), [items]);
  const shippingFee = 2500;
  const grandTotal = subtotal + shippingFee;

  // 3. SUCCESS HANDLER: The Final Bridge
 const handlePaymentSuccess = async (reference: any) => {
  try {
    // 1. Create the Order in the DB FIRST
    const orderRes = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        formData,
        items,
        subtotal,
        shipping: shippingFee,
        total: grandTotal,
      }),
    });

    const orderData = await orderRes.json();

    if (!orderRes.ok || !orderData.orderId) {
      throw new Error(orderData.error || "Failed to initialize order in database.");
    }

    // 2. Now verify the payment with the confirmed Order ID
    const verifyRes = await fetch("/api/orders/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        reference: reference.reference, 
        orderId: orderData.orderId 
      }),
    });

    if (verifyRes.ok) {
      dispatch(clearCart());
      localStorage.removeItem("marvel_cart");
      notifySuccess("Loot Secured!");
      
      // Hard redirect to the success page
      window.location.href = `/order-success/${orderData.orderId}`;
    } else {
      const errorMsg = await verifyRes.json();
      notifyError(`Verification failed: ${errorMsg.error}`);
    }
  } catch (err: any) {
    console.error("CHECKOUT_FLOW_ERROR:", err);
    notifyError(err.message || "An error occurred. Please contact support.");
  }
};

  const handleGeolocation = () => {
    if (!navigator.geolocation) return notifyError("Geolocation not supported");
    notifySuccess("Detecting position...");
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
        notifySuccess("Location found!");
      } catch (err) {
        notifyError("Could not fetch address details");
      }
    });
  };

  if (!mounted || status === "loading") {
    return (
      <div className="min-h-screen bg-neutral-light flex items-center justify-center text-accent-navy font-black italic uppercase">
        Verifying Identity...
      </div>
    );
  }

  return (
    <div className="bg-neutral-white min-h-screen pb-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-7 space-y-10">
            <Link href="/cart" className="flex items-center gap-2 text-sm font-black uppercase text-neutral-gray hover:text-brand-primary transition-colors">
              <ChevronLeft size={18} /> Edit Stash
            </Link>

            <div className="space-y-10">
              <section className="bg-white p-8 rounded-3xl border border-neutral-light shadow-sm">
                <h3 className="text-2xl font-black italic uppercase mb-6 text-accent-navy">Contact Info</h3>
                <input 
                  type="email" name="email" value={formData.email} onChange={handleInputChange}
                  placeholder="Email Address" 
                  className="w-full p-5 bg-neutral-light rounded-2xl outline-none border border-transparent focus:border-brand-primary transition-all text-lg"
                  required
                />
              </section>

              <section className="bg-white p-8 rounded-3xl border border-neutral-light shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-black italic uppercase text-accent-navy">Billing Address</h3>
                  <button type="button" onClick={handleGeolocation} className="flex items-center gap-2 text-xs font-black uppercase text-brand-primary border-2 border-brand-primary/20 px-4 py-2 rounded-xl hover:bg-brand-primary hover:text-white transition-all">
                    <MapPin size={16} /> Auto-fill
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="First Name *" className="p-4 bg-neutral-light rounded-xl text-lg outline-none border border-transparent focus:border-brand-primary" required />
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Last Name *" className="p-4 bg-neutral-light rounded-xl text-lg outline-none border border-transparent focus:border-brand-primary" required />
                  <input type="text" name="streetAddress" value={formData.streetAddress} onChange={handleInputChange} placeholder="Street Address *" className="md:col-span-2 p-4 bg-neutral-light rounded-xl text-lg outline-none border border-transparent focus:border-brand-primary" required />
                  <input type="text" name="apartment" value={formData.apartment} onChange={handleInputChange} placeholder="Apartment, suite, etc. (optional)" className="md:col-span-2 p-4 bg-neutral-light rounded-xl text-lg outline-none border border-transparent focus:border-brand-primary" />
                  <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="Town / City *" className="p-4 bg-neutral-light rounded-xl text-lg outline-none border border-transparent focus:border-brand-primary" required />
                  <div className="relative">
                    <select name="state" value={formData.state} onChange={handleInputChange} className="w-full p-4 bg-neutral-light rounded-xl text-lg outline-none border border-transparent focus:border-brand-primary appearance-none font-bold text-accent-navy" required>
                      <option value="">Select State *</option>
                      {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-gray pointer-events-none" size={20} />
                  </div>
                </div>
              </section>

              <section className="p-6 border-2 border-dashed border-neutral-light rounded-[2rem]">
                <label className="flex items-center gap-4 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="w-6 h-6 accent-brand-primary rounded" 
                    checked={formData.useDifferentShipping}
                    onChange={(e) => setFormData({...formData, useDifferentShipping: e.target.checked})}
                  />
                  <span className="text-lg font-black uppercase italic text-accent-navy group-hover:text-brand-primary transition-colors">Ship to a different address?</span>
                </label>
                
                {formData.useDifferentShipping && (
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
                    <input type="text" name="firstName" value={formData.shippingDetails.firstName} onChange={handleShippingChange} placeholder="Receiver's First Name *" className="p-4 bg-neutral-light rounded-xl text-lg outline-none border border-transparent focus:border-brand-primary" required />
                    <input type="text" name="lastName" value={formData.shippingDetails.lastName} onChange={handleShippingChange} placeholder="Receiver's Last Name *" className="p-4 bg-neutral-light rounded-xl text-lg outline-none border border-transparent focus:border-brand-primary" required />
                    <input type="text" name="streetAddress" value={formData.shippingDetails.streetAddress} onChange={handleShippingChange} placeholder="Shipping Street Address *" className="md:col-span-2 p-4 bg-neutral-light rounded-xl text-lg outline-none border border-transparent focus:border-brand-primary" required />
                    <input type="text" name="city" value={formData.shippingDetails.city} onChange={handleShippingChange} placeholder="Shipping City *" className="p-4 bg-neutral-light rounded-xl text-lg outline-none border border-transparent focus:border-brand-primary" required />
                    <div className="relative">
                      <select name="state" value={formData.shippingDetails.state} onChange={handleShippingChange} className="w-full p-4 bg-neutral-light rounded-xl text-lg outline-none border border-transparent focus:border-brand-primary appearance-none font-bold text-accent-navy" required>
                        <option value="">Select Shipping State *</option>
                        {NIGERIAN_STATES.map(s => <option key={`ship-${s}`} value={s}>{s}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-gray pointer-events-none" size={20} />
                    </div>
                  </div>
                )}
              </section>

              <PaystackButton 
                email={formData.email || session?.user?.email || ""}
                amount={grandTotal}
                metadata={{
                  ...formData,
                  custom_fields: [
                    { display_name: "Order Type", variable_name: "order_type", value: "checkout" }
                  ]
                }}
                onSuccess={handlePaymentSuccess}
                onClose={() => notifyError("Loot acquisition aborted.")}
              />
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-neutral-light rounded-[2.5rem] p-10 sticky top-24 border border-neutral-200 shadow-sm">
              <h2 className="text-3xl font-black italic uppercase mb-10 text-accent-navy border-b-2 border-neutral-200 pb-4">Your <span className="text-brand-primary">Order</span></h2>
              
              <div className="space-y-8 max-h-[450px] overflow-y-auto pr-4 mb-10 custom-scrollbar">
                {items.map((item) => (
                  <div key={`${item.id}-${item.variantId || 'base'}`} className="flex gap-6 items-center">
                    <div className="relative w-24 h-24 bg-white rounded-2xl flex-shrink-0 shadow-sm overflow-hidden border border-white">
                      <Image 
                        src={(item.imageUrl && item.imageUrl !== "/images/placeholder.jpg") ? item.imageUrl : "/logo.png"} 
                        alt={item.title} fill className="object-contain p-3" 
                        sizes="96px"
                      />
                      <div className="absolute -top-1 -right-1 bg-brand-primary text-white text-[10px] w-7 h-7 rounded-full flex items-center justify-center font-black shadow-lg">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-black uppercase italic leading-tight text-accent-navy">{item.title}</h4>
                      <p className="text-xs font-bold text-neutral-gray uppercase mt-1">{item.variantName || "Standard Gear"}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-lg text-accent-navy italic">₦{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 mb-10 border-t border-neutral-200 pt-8">
                <div className="flex justify-between text-base font-bold uppercase tracking-widest text-neutral-gray">
                  <span>Subtotal</span>
                  <span className="text-accent-navy">₦{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base font-bold uppercase tracking-widest text-neutral-gray">
                  <span>Shipping</span>
                  <span className="text-accent-navy">₦{shippingFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-end border-t-4 border-brand-primary pt-6 mt-6">
                  <span className="text-2xl font-black uppercase italic text-accent-navy">Total</span>
                  <span className="text-4xl font-black text-brand-primary italic">₦{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-white/60 p-5 rounded-2xl flex items-center gap-5 border border-brand-primary/10">
                <ShieldCheck className="text-green-500" size={40} />
                <p className="text-xl font-bold uppercase text-neutral-gray leading-relaxed">Secure 256-bit encrypted checkout.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}