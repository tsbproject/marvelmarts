// "use client";

// import { useEffect, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import Image from "next/image"; // Ensure Next.js Image is imported
// import Link from "next/link";

// export default function OrderSuccessPage() {
//   const router = useRouter();
//   const params = useParams();
//   const orderId = params?.orderId as string;

//   // Added missing state to hold order details
//   const [order, setOrder] = useState<any>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const resolveOrder = async () => {
//       try {
//         const res = await fetch(`/api/orders/legacy/${orderId}`);
//         const data = await res.json();

//         if (!res.ok || !data?.orderNumber) {
//           throw new Error(data?.error || "Failed to resolve order");
//         }

//         // Set the order data to state instead of just redirecting
//         setOrder(data);
//         setLoading(false);
        
//         // Optional: If you still want to redirect to the new thank-you page after 5 seconds:
//         // setTimeout(() => router.replace(`/thank-you?orderNumber=${data.orderNumber}`), 5000);
//       } catch (err) {
//         console.error("Legacy order resolution failed:", err);
//         router.replace("/thank-you");
//       }
//     };

//     if (orderId) resolveOrder();
//     else router.replace("/thank-you");
//   }, [orderId, router]);

//   // Handle the Loading State correctly
//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center font-black italic uppercase text-accent-navy bg-white">
//         <div className="flex flex-col items-center gap-4">
//           <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
//           Loading Order Details...
//         </div>
//       </div>
//     );
//   }

//   // Final Render (Only one return statement reached after loading is false)
//   return (
//     <div className="min-h-screen bg-neutral-light py-10 sm:py-20 px-4">
//       <div className="max-w-2xl mx-auto bg-white rounded-[2.5rem] overflow-hidden shadow-2xl">
        
//         {/* Branding & Header section */}
//         <div className="bg-accent-navy p-8 sm:p-10 text-center text-white">
//           <div className="mb-8 flex justify-center">
//             <Image 
//               src="/logo.png" 
//               width={180}
//               height={80}
//               alt="MarvelMarts Logo" 
//               className="h-20 sm:h-25 w-auto object-contain" 
//             />
//           </div>

//           <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
//             <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
//             </svg>
//           </div>
//           <h1 className="text-3xl sm:text-4xl font-black italic uppercase mb-2 tracking-tighter">Order Secured</h1>
//           <p className="text-blue-200 font-bold uppercase text-[10px] sm:text-sm tracking-widest">Your gear is being prepped for dispatch.</p>
//         </div>

//         {/* Data section */}
//         <div className="p-6 sm:p-10 space-y-8">
//           {/* Top Bar: Order Number & Total */}
//           <div className="flex flex-col sm:flex-row justify-between border-b-2 border-neutral-100 pb-6 gap-4">
//             <div>
//               <p className="text-[10px] font-black text-neutral-gray uppercase mb-1">Order Number</p>
//               <p className="text-xl font-black text-accent-navy">{order?.orderNumber || "MARVEL-XXXX"}</p>
//             </div>
//             <div className="sm:text-right">
//               <p className="text-[10px] font-black text-neutral-gray uppercase mb-1">Total Paid</p>
//               <p className="text-xl font-black text-accent-navy">₦{order?.total?.toLocaleString()}</p>
//             </div>
//           </div>

//           {/* Itemized List */}
//           <div className="border-b-2 border-neutral-100 pb-6">
//             <p className="text-[10px] font-black text-neutral-gray uppercase mb-4">Items Secured</p>
//             <div className="space-y-4">
//               {order?.items?.map((item: any) => (
//                 <div key={item.id} className="flex items-center justify-between gap-4">
//                   <div className="flex items-center gap-4">
//                     <div className="w-14 h-14 bg-neutral-100 rounded-xl overflow-hidden border border-neutral-200 flex-shrink-0">
//                       <img 
//                         src={item.imageUrl || '/placeholder.png'} 
//                         alt={item.title} 
//                         className="w-full h-full object-cover"
//                       />
//                     </div>
//                     <div>
//                       <p className="text-sm font-black text-accent-navy uppercase leading-tight">{item.title}</p>
//                       <p className="text-[10px] font-bold text-neutral-gray uppercase">Qty: {item.qty}</p>
//                     </div>
//                   </div>
//                   <p className="text-sm font-black text-accent-navy whitespace-nowrap">
//                     ₦{(Number(item.unitPrice) * item.qty).toLocaleString()}
//                   </p>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Detailed Breakdown */}
//           <div className="space-y-3 border-b-2 border-neutral-100 pb-6">
//             <div className="flex justify-between text-[11px] font-bold uppercase text-neutral-gray">
//               <span>Subtotal</span>
//               <span>₦{order?.subtotal?.toLocaleString()}</span>
//             </div>
//             <div className="flex justify-between text-[11px] font-bold uppercase text-neutral-gray">
//               <span>Shipping Fee</span>
//               <span>₦{order?.shipping?.toLocaleString()}</span>
//             </div>
//           </div>

//           {/* Shipping Address */}
//           <div>
//             <p className="text-[10px] font-black text-neutral-gray uppercase mb-3">Shipping To:</p>
//             <div className="text-accent-navy font-bold leading-relaxed bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
//               <p className="uppercase tracking-tight">{order?.firstName} {order?.lastName}</p>
//               <p className="text-sm opacity-80">{order?.streetAddress}</p>
//               <p className="text-sm opacity-80">{order?.city}, {order?.state}</p>
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
//             <Link href="/" className="bg-accent-navy text-white py-4 rounded-xl font-black uppercase text-center text-[10px] sm:text-xs hover:bg-brand-primary transition-all shadow-md active:scale-95">
//               Continue Shopping
//             </Link>
//             <Link href="/orders/track-order" className="border-2 border-accent-navy text-center text-accent-navy py-4 rounded-xl font-black uppercase text-[10px] sm:text-xs hover:bg-neutral-light transition-all active:scale-95"> 
//               Track Order
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function OrderSuccessPage() {
  const params = useParams();
  const orderId = params?.orderId as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // Step 1: resolve old DB id to orderNumber
        const legacyRes = await fetch(`/api/orders/legacy/${orderId}`);
        const legacyData = await legacyRes.json();

        if (!legacyRes.ok || !legacyData?.orderNumber) {
          throw new Error(legacyData?.error || "Failed to resolve order");
        }

        // Step 2: fetch full order details using orderNumber
        const fullRes = await fetch(`/api/orders/${legacyData.orderNumber}`);
        const fullData = await fullRes.json();

        if (!fullRes.ok) {
          throw new Error(fullData?.error || "Failed to fetch full order");
        }

        setOrder({
          ...fullData,
          total: Number(fullData.total),
          subtotal: Number(fullData.subtotal),
          shipping: Number(fullData.shipping),
        });
      } catch (err) {
        console.error("Frontend fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) fetchOrder();
    else setLoading(false);
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-black italic uppercase text-accent-navy">
        Loading Order Details...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-light py-20 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="bg-accent-navy p-10 text-center text-white">
          <div className="mb-8 flex justify-center">
            <Image
              src="/logo.png"
              width={180}
              height={80}
              alt="MarvelMarts Logo"
              className="h-25 w-auto object-contain "
            />
          </div>

          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 className="text-4xl font-black italic uppercase mb-2 tracking-tighter">Order Secured</h1>
          <p className="text-blue-200 font-bold uppercase text-sm tracking-widest">Your gear is being prepped for dispatch.</p>
        </div>

        <div className="p-10 space-y-8">
          <div className="flex justify-between border-b-2 border-neutral-100 pb-6">
            <div>
              <p className="text-[10px] font-black text-neutral-gray uppercase mb-1">Order Number</p>
              <p className="text-xl font-black text-accent-navy">{order?.orderNumber || "MARVEL-XXXX"}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-neutral-gray uppercase mb-1">Total Paid</p>
              <p className="text-xl font-black text-accent-navy">₦{order?.total?.toLocaleString()}</p>
            </div>
          </div>

          <div className="border-b-2 border-neutral-100 pb-6">
            <p className="text-[10px] font-black text-neutral-gray uppercase mb-4">Items Secured</p>
            <div className="space-y-4">
              {order?.items?.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-neutral-100 rounded-xl overflow-hidden border border-neutral-200 flex-shrink-0">
                      <img
                        src={item.imageUrl || "/placeholder.png"}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-black text-accent-navy uppercase leading-tight">{item.title}</p>
                      <p className="text-[10px] font-bold text-neutral-gray uppercase">Qty: {item.qty}</p>
                    </div>
                  </div>
                  <p className="text-sm font-black text-accent-navy">
                    ₦{(Number(item.unitPrice) * item.qty).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3 border-b-2 border-neutral-100 pb-6">
            <div className="flex justify-between text-[11px] font-bold uppercase text-neutral-gray">
              <span>Subtotal</span>
              <span>₦{order?.subtotal?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[11px] font-bold uppercase text-neutral-gray">
              <span>Shipping Fee</span>
              <span>₦{order?.shipping?.toLocaleString()}</span>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-black text-neutral-gray uppercase mb-3">Shipping To:</p>
            <div className="text-accent-navy font-bold leading-relaxed bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
              <p className="uppercase tracking-tight">{order?.firstName} {order?.lastName}</p>
              <p className="text-sm opacity-80">{order?.streetAddress}</p>
              <p className="text-sm opacity-80">{order?.city}, {order?.state}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <Link href="/" className="bg-accent-navy text-white py-4 rounded-xl font-black uppercase text-center text-sm hover:bg-brand-primary transition-all shadow-md active:scale-95">
              Continue Shopping
            </Link>

            <Link href={`/orders/track-order?orderNumber=${order?.orderNumber}`} className="border-2 border-accent-navy text-center text-accent-navy py-4 rounded-xl font-black uppercase text-lg hover:bg-neutral-light transition-all active:scale-95">
              Track Order
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

