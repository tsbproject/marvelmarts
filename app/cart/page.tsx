"use client";

import { useEffect, useState } from "react";
import { useSessionContext } from "@/app/_context/useSessionContext";
import Image from "next/image";

interface CartItem {
  id: number;
  product: { id: number; title: string; imageUrl: string };
  variant: { id: number; name?: string } | null;
  qty: number;
  unitPrice: number;
}

interface Cart {
  id: number | null;
  userId: number | null;
  items: CartItem[];
}

export default function CartPage() {
  const { session, status } = useSessionContext();
  const [cart, setCart] = useState<Cart | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetch("/api/cart")
        .then((res) => res.json())
        .then((data) => setCart(data))
        .catch(console.error);
    }
  }, [status, session]);

  if (status === "loading") return <div>Loading session...</div>;
  if (status === "unauthenticated") return <div>Please log in to see your cart.</div>;
  if (!cart) return <div>Loading cart...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold">Shopping Cart</h1>
      <div className="mt-4">
        {cart.items.length === 0 ? (
          <p>Your cart is empty</p>
        ) : (
          <div className="space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="border p-4 rounded-lg flex gap-4 items-center">
                <Image src={item.product.imageUrl} alt={item.product.title} width={80} height={80} />
                <div>
                  <h2 className="text-xl">{item.product.title}</h2>
                  <p>{item.variant?.name}</p>
                  <span className="text-lg">${item.unitPrice}</span>
                  <div className="mt-2">Quantity: {item.qty}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mt-4">
        <button className="bg-blue-500 text-white px-4 py-2 rounded">Checkout</button>
      </div>
    </div>
  );
}
