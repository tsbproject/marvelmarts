"use client";

import React, { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { createOrder } from "@/app/lib/checkout/create-order";

interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  streetAddress: string;
  apartment?: string;
  city: string;
  state: string;
  country?: string;
  orderNotes?: string;
  useDifferentShipping?: boolean;
  shippingDetails?: {
    firstName?: string;
    lastName?: string;
    streetAddress?: string;
    city?: string;
    state?: string;
  };
}

interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  variantId?: string | null;
  variantName?: string | null;
}

interface PaystackWrapperProps {
  formData: CheckoutFormData;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  platformShippingMethod?: string;
  onClose?: () => void;
  buttonLabel?: string;
  className?: string;
}

export default function PaystackWrapper({
  formData,
  items,
  subtotal,
  shipping,
  total,
  platformShippingMethod,
  onClose,
  buttonLabel = "Proceed to Payment",
  className = "w-full bg-brand-primary text-white py-7 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm md:text-2xl hover:bg-accent-navy transition-all flex items-center justify-center gap-4 shadow-2xl shadow-brand-primary/40 group active:scale-95",
}: PaystackWrapperProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (loading) return;

    try {
      setLoading(true);

      const order = await createOrder({
        formData,
        items,
        subtotal,
        shipping,
        total,
        platformShippingMethod,
      });

      if (!order.url) {
        throw new Error(
          "Payment gateway URL not returned."
        );
      }

      window.location.href = order.url;
    
} catch (error: any) {
      alert(error.message || "Unable to proceed to payment.");
      onClose?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCheckout}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 size={28} className="animate-spin" /> Initializing Payment
        </>
      ) : (
        <>
          <CreditCard size={32} /> {buttonLabel}
        </>
      )}
    </button>
  );
}
