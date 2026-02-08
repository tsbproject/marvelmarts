"use client";

import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import DashboardHeader from "@/app/_components/DashboardHeader";
import RefundRequestButton from "../../_components/RefundRequestButton";
import Link from "next/link";
import { ArrowLeft, Package, MapPin, CreditCard, ShoppingBag } from "lucide-react";

export default function OrderDetailsPage() {
  const { id } = useParams();
  
  // Find the order in the Redux store
  const order = useSelector((state: RootState) => 
    state.orders.orders.find((o) => o.id === id)
  );

  const nairaFormatter = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  });

  // Guard Clause: Handle missing order or Redux reset on refresh
  if (!order) {
    return (
      <div className="min-h-screen bg-neutral-light/30">
        <DashboardHeader title="Order Details" showLogout={false} />
        <div className="p-8 text-center flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
            <ShoppingBag className="text-neutral-gray opacity-20" size={40} />
          </div>
          <h2 className="text-2xl font-black text-accent-navy mb-2">Order Not Found</h2>
          <p className="text-neutral-gray mb-8 max-w-sm">
            We couldn't find the details for this order. It may have been archived or you might need to refresh your dashboard.
          </p>
          <Link 
            href="/account/customer/orders" 
            className="bg-brand-primary text-accent-navy px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg hover:bg-accent-navy hover:text-white transition-all"
          >
            Back to My Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-light/30">
      <DashboardHeader 
        title={`Order #${order.id.slice(-6).toUpperCase()}`} 
        showLogout={false} 
      />
      
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Link 
          href="/account/customer/orders" 
          className="group flex items-center text-sm font-black uppercase tracking-widest text-neutral-gray hover:text-brand-primary transition-colors"
        >
          <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
          Back to My Orders
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Order Items Section */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
              <h3 className="text-xl font-black text-accent-navy mb-6 flex items-center uppercase tracking-tight">
                <Package className="mr-3 text-brand-primary" size={24} /> 
                Items in Order
              </h3>
              
              <div className="divide-y divide-gray-100">
                {/* SAFE CHECK: Ensure order.items exists before mapping */}
                {order.items && order.items.length > 0 ? (
                  order.items.map((item) => (
                    <div key={item.id} className="py-6 flex justify-between items-center group">
                      <div className="space-y-1">
                        <p className="font-black text-accent-navy group-hover:text-brand-primary transition-colors">
                          {item.name}
                        </p>
                        <p className="text-xs font-bold text-neutral-gray uppercase tracking-widest">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <p className="font-black text-accent-navy text-lg">
                        {nairaFormatter.format(item.price * item.quantity)}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center text-neutral-gray italic font-medium">
                    No item data available for this order.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Summary & Refund Sidebar */}
          <div className="space-y-6">
            <div className="bg-accent-navy text-white p-8 rounded-[32px] shadow-2xl shadow-accent-navy/20 relative overflow-hidden">
              {/* Decorative background glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 blur-3xl rounded-full -mr-16 -mt-16" />
              
              <h3 className="text-xl font-black mb-6 uppercase tracking-widest">Summary</h3>
              
              <div className="space-y-4 text-sm font-medium">
                <div className="flex justify-between opacity-70">
                  <span>Subtotal</span>
                  <span>{nairaFormatter.format(order.total)}</span>
                </div>
                <div className="flex justify-between opacity-70">
                  <span>Shipping</span>
                  <span>₦0.00</span>
                </div>
                <div className="border-t border-white/10 pt-4 flex justify-between font-black text-xl text-brand-primary">
                  <span>Total</span>
                  <span>{nairaFormatter.format(order.total)}</span>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/10">
                <p className="text-[10px] uppercase font-black tracking-[0.2em] mb-4 text-brand-light/50">
                  Order Management
                </p>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                   <RefundRequestButton 
                    orderId={order.id} 
                    orderStatus={order.status} 
                    refundStatus={order.refundStatus || "none"} 
                  />
                </div>
              </div>
            </div>

            {/* Support Box */}
            <div className="bg-brand-light/50 p-6 rounded-[32px] border border-brand-primary/10 text-center">
              <p className="text-xs font-bold text-accent-navy/60 uppercase tracking-widest mb-1">Need Help?</p>
              <p className="text-sm font-black text-accent-navy">support@marvelmarts.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


