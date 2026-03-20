



"use client";

import React from "react";
import { 
  Package, User, MapPin, Phone, 
  Calendar, X, Printer, ArrowLeft,
  MessageSquare, Hash, ShieldCheck
} from "lucide-react";
import { formatNaira } from "@/app/lib/FormatNaira";
import OrderActionWrapper from "./OrderActionWrapper";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Props {
  order: any;
  onClose?: () => void;
  isDrawer?: boolean;
}

export default function OrderDetailsUI({ order, onClose, isDrawer }: Props) {
  const router = useRouter();
  if (!order) return null;

  const dynamicOrder = order as any;
  const productImg = dynamicOrder.productImage || dynamicOrder.product?.images?.[0] || null;
  
  return (
    <div className={`flex flex-col bg-[#FBFBFB] print:bg-white ${isDrawer ? 'h-full overflow-y-auto' : 'min-h-screen'}`}>
      
      {/* HEADER */}
      <div className="sticky top-0 z-10 p-6 border-b bg-white flex justify-between items-center print:hidden shadow-sm">
        <div className="flex items-center gap-4">
          {!isDrawer ? (
            <button 
              onClick={() => router.push("/account/vendor/orders")} 
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={20} className="text-accent-navy" />
            </button>
          ) : (
            <div className="w-1 bg-brand-primary h-6 rounded-full" />
          )}
          <h2 className="text-lg md:text-xl font-black text-accent-navy uppercase tracking-tighter">
            Order <span className="text-brand-primary">#{order.id.slice(-8).toUpperCase()}</span>
          </h2>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.print()}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-accent-navy text-[10px] font-black uppercase rounded-xl transition-all"
          >
            <Printer size={16} /> Print
          </button>
          {isDrawer && (
            <button onClick={onClose} className="p-2 hover:bg-red-50 text-red-500 rounded-full transition-colors">
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* CONTENT AREA: max-w is removed for Drawer mode to allow full expansion */}
      <div className={`p-4 md:p-8 w-full space-y-6 print:p-0 ${isDrawer ? 'max-w-full' : 'max-w-6xl mx-auto'}`}>
        
        {/* Main Grid: Stacks on medium screens, 3-cols on large */}
        <div className={`grid grid-cols-1 ${isDrawer ? 'xl:grid-cols-1' : 'lg:grid-cols-1'} gap-8`}>
          
          {/* LEFT COLUMN: Product & Shipping */}
          <div className={`${isDrawer ? 'xl:col-span-2' : 'lg:col-span-2'} space-y-6`}>
            
            {/* PRODUCT CARD */}
            <div className="bg-white p-6 md:p-8 rounded-4xl border border-gray-100 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
                <div>
                  <p className="text-[10px] font-black text-neutral-gray uppercase tracking-widest">Global Order ID</p>
                  <h2 className="text-xl md:text-2xl font-black text-accent-navy uppercase flex items-center gap-2 break-all">
                    <Hash size={20} className="text-brand-primary shrink-0" /> {order.id.toUpperCase()}
                  </h2>
                </div>
                <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase shrink-0 ${
                  order.status === 'PENDING' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 
                  order.status === 'APPROVED' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
                }`}>
                  {order.status}
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-gray-50 rounded-3xl border border-gray-100">
                <div className="relative w-32 h-32 bg-white rounded-2xl border border-gray-100 overflow-hidden shrink-0">
                  {productImg ? (
                    <Image src={productImg} alt="Product" fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200">
                      <Package size={40} />
                    </div>
                  )}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-lg font-black text-accent-navy uppercase italic mb-2">
                    {dynamicOrder.productTitle || "MarvelMarts Product"}
                  </h3>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 text-[10px] font-bold text-neutral-gray uppercase">
                    <span>Qty: {dynamicOrder.items?.[0]?.qty || 1}</span>
                    <span className="text-gray-300">•</span>
                    <span>Total: {formatNaira(Number(order.total))}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SHIPPING DESTINATION CARD */}
            <div className="bg-white p-6 md:p-8 rounded-4xl border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-primary" />
              <h3 className="text-md font-black text-accent-navy uppercase mb-6 flex items-center gap-2">
                <MapPin size={18} className="text-brand-primary" /> Delivery Destination
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <p className="text-[9px] font-black text-neutral-gray uppercase mb-1">Street Address</p>
                    <p className="text-sm font-bold text-accent-navy uppercase italic leading-relaxed">
                      {dynamicOrder.streetAddress || dynamicOrder.address || "No Street Provided"}
                    </p>
                  </div>
                  {dynamicOrder.apartment && (
                    <div>
                      <p className="text-[9px] font-black text-neutral-gray uppercase mb-1">Apartment / Suite</p>
                      <p className="text-sm font-bold text-accent-navy uppercase italic">{dynamicOrder.apartment}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[9px] font-black text-neutral-gray uppercase mb-1">City</p>
                      <p className="text-sm font-bold text-accent-navy uppercase italic">{dynamicOrder.city || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-neutral-gray uppercase mb-1">State</p>
                      <p className="text-sm font-bold text-accent-navy uppercase italic">{dynamicOrder.state || "N/A"}</p>
                    </div>
                  </div>
                  {dynamicOrder.orderNotes && (
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 mt-4">
                      <MessageSquare size={16} className="text-amber-600 shrink-0" />
                      <div>
                        <p className="text-[9px] font-black text-amber-800 uppercase">Customer Note</p>
                        <p className="text-[11px] font-medium text-amber-900 italic leading-tight">"{dynamicOrder.orderNotes}"</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Customer & Merchant Actions */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-4xl border border-gray-100 shadow-sm">
              <h3 className="text-sm font-black text-accent-navy uppercase mb-6 flex items-center gap-2">
                <User size={18} className="text-brand-primary" /> Customer Profile
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                   <div className="w-12 h-12 rounded-xl bg-accent-navy flex items-center justify-center text-white font-black uppercase overflow-hidden border-2 border-white shadow-sm shrink-0">
                      {order.user?.image ? (
                        <Image 
                        src={order.user.image} 
                        alt="User" 
                        width={48} 
                        height={48} 
                        className="object-cover"/>
                      ) : (
                        <span className="text-lg">{dynamicOrder.customerName?.charAt(0) || "U"}</span>
                      )}
                   </div>
                   <div className="min-w-0">
                      <p className="text-xs font-black text-accent-navy uppercase truncate mb-0.5">
                        {dynamicOrder.customerName || order.user?.name}
                      </p>
                      <p className="text-[10px] font-bold text-neutral-gray truncate lowercase">{dynamicOrder.customerEmail || order.user?.email}</p>
                   </div>
                </div>
                
                <div className="pt-2 space-y-2">
                  <div className="flex items-center justify-between p-3 border border-gray-50 rounded-2xl">
                    <span className="text-[10px] font-black text-neutral-gray uppercase flex items-center gap-2">
                      <Phone size={12} className="text-brand-primary" /> Contact
                    </span>
                    <p className="text-[10px] font-black text-accent-navy">{dynamicOrder.phone || "N/A"}</p>
                  </div>

                  <div className="flex items-center justify-between p-3 border border-gray-50 rounded-2xl">
                    <span className="text-[10px] font-black text-neutral-gray uppercase flex items-center gap-2">
                      <Calendar size={12} className="text-brand-primary" /> Placed
                    </span>
                    <p className="text-[10px] font-black text-accent-navy text-right">
                      {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-2xl border border-green-100">
                    <span className="text-[10px] font-black text-green-700 uppercase flex items-center gap-2">
                      <ShieldCheck size={12} /> Status
                    </span>
                    <p className="text-[10px] font-black text-green-700">PAID</p>
                  </div>
                </div>
              </div>
            </div>

            <OrderActionWrapper 
              orderId={order.id} 
              currentStatus={order.status} 
              trackingNumber={dynamicOrder.trackingNumber} 
            />
          </div>

        </div>
      </div>
    </div>
  );
}