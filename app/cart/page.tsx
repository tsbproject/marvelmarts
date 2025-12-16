// 'use client';

// import { useEffect, useState } from "react";
// import { useSessionContext } from "@/app/_context/useSessionContext";
// import Image from "next/image";
// import { ShoppingCart } from "lucide-react";

// interface CartItem {
//   id: number;
//   product: { id: number; title: string; imageUrl: string };
//   variant: { id: number; name?: string } | null;
//   qty: number;
//   unitPrice: number;
// }

// interface Cart {
//   id: number | null;
//   userId: number | null;
//   items: CartItem[];
// }

// export default function CartPage() {
//   const { session, status } = useSessionContext();
//   const [cart, setCart] = useState<Cart | null>(null);

//   useEffect(() => {
//     if (status === "authenticated" && session?.user?.id) {
//       fetch("/api/cart")
//         .then((res) => res.json())
//         .then((data) => setCart(data))
//         .catch(console.error);
//     }
//   }, [status, session]);

//   if (status === "loading") return <div>Loading session...</div>;
//   if (status === "unauthenticated") return <div>Please log in to see your cart.</div>;
//   if (!cart) return <div>Loading cart...</div>;

//   return (
//     <div className="container mx-auto p-4">
//       {/* Cart Header with Icon */}
//       <div className="flex items-center gap-3">
//         <ShoppingCart className="w-8 h-8 text-blue-600" />
//         <h1 className="text-4xl font-bold">Shopping Cart</h1>
//         {cart.items.length > 0 && (
//           <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
//             {cart.items.length}
//           </span>
//         )}
//       </div>

//       <div className="mt-4">
//         {cart.items.length === 0 ? (
//           <p>Your cart is empty</p>
//         ) : (
//           <div className="space-y-4">
//             {cart.items.map((item) => (
//               <div key={item.id} className="border p-4 rounded-lg flex gap-4 items-center">
//                 <Image src={item.product.imageUrl} alt={item.product.title} width={80} height={80} />
//                 <div>
//                   <h2 className="text-xl">{item.product.title}</h2>
//                   <p>{item.variant?.name}</p>
//                   <span className="text-lg">${item.unitPrice}</span>
//                   <div className="mt-2">Quantity: {item.qty}</div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       <div className="mt-4">
//         <button className="bg-blue-500 text-white px-4 py-2 rounded">Checkout</button>
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useSessionContext } from "@/app/_context/useSessionContext";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";

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
    } else if (status === "unauthenticated") {
      // Load guest cart from localStorage
      const guestCart = localStorage.getItem("guestCart");
      if (guestCart) {
        setCart(JSON.parse(guestCart));
      } else {
        setCart({ id: null, userId: null, items: [] });
      }
    }
  }, [status, session]);

  if (status === "loading") return <div>Loading session...</div>;
  if (!cart) return <div>Loading cart...</div>;

  return (
    <div className="container mx-auto p-4">
      {/* Cart Header with Icon */}
      <div className="flex items-center gap-3">
        <ShoppingCart className="w-8 h-8 text-blue-600" />
        <h1 className="text-4xl font-bold">Shopping Cart</h1>
        {cart.items.length > 0 && (
          <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
            {cart.items.length}
          </span>
        )}
      </div>

      <div className="mt-6">
        {cart.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center space-y-4 py-12">
            {/* Empty Cart Illustration */}
            <Image
              src="/images/empty-shopping-cart.png" // 👉 place an illustration in /public/images
              alt="Empty Cart"
              width={160}
              height={160}
              className="opacity-80"
            />
            <p className="text-gray-600 text-lg font-medium">
              Your cart is empty
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="border p-4 rounded-lg flex gap-4 items-center"
              >
                <Image
                  src={item.product.imageUrl}
                  alt={item.product.title}
                  width={80}
                  height={80}
                  className="rounded"
                />
                <div>
                  <h2 className="text-xl font-semibold">{item.product.title}</h2>
                  {item.variant?.name && (
                    <p className="text-sm text-gray-500">{item.variant.name}</p>
                  )}
                  <span className="text-lg font-semibold">${item.unitPrice}</span>
                  <div className="mt-2 text-sm">Quantity: {item.qty}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {cart.items.length > 0 && (
        <div className="mt-6">
          <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
            Checkout
          </button>
        </div>
      )}
    </div>
  );
}
