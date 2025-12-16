


// "use client";

// import { motion, AnimatePresence } from "framer-motion";
// import { ShoppingCart, X } from "lucide-react";
// import { useState, useEffect } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { useSessionContext } from "@/app/_context/useSessionContext";

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

// export default function CartDrawer() {
//   const { session, status } = useSessionContext();
//   const [cart, setCart] = useState<Cart | null>(null);
//   const [open, setOpen] = useState(false);

//   // Load cart depending on auth state
//   useEffect(() => {
//     if (status === "authenticated" && session?.user?.id) {
//       // Fetch server cart
//       fetch("/api/cart")
//         .then((res) => res.json())
//         .then(async (data) => {
//           // Merge guest cart if exists
//           const guestCart = localStorage.getItem("guestCart");
//           if (guestCart) {
//             await fetch("/api/cart/merge", {
//               method: "POST",
//               headers: { "Content-Type": "application/json" },
//               body: guestCart,
//             });
//             localStorage.removeItem("guestCart");
//             // Re-fetch merged cart
//             const merged = await fetch("/api/cart").then((r) => r.json());
//             setCart(merged);
//           } else {
//             setCart(data);
//           }
//         })
//         .catch(console.error);
//     } else if (status === "unauthenticated") {
//       // Load guest cart from localStorage
//       const guestCart = localStorage.getItem("guestCart");
//       if (guestCart) {
//         setCart(JSON.parse(guestCart));
//       } else {
//         setCart({ id: null, userId: null, items: [] });
//       }
//     }
//   }, [status, session]);

//   // Save guest cart to localStorage when it changes
//   useEffect(() => {
//     if (status === "unauthenticated" && cart) {
//       localStorage.setItem("guestCart", JSON.stringify(cart));
//     }
//   }, [cart, status]);

//   return (
//     <div>
//       {/* Cart Icon + Label */}
//       <button
//         onClick={() => setOpen(true)}
//         aria-label="Open Cart"
//         className="flex items-center gap-2 relative text-gray-800 hover:text-blue-600 transition-colors duration-200"
//       >
//         <ShoppingCart className="w-8 h-8 text-brand-primary" />
//         <span className="text-sm font-medium">Cart</span>
//         {cart && cart.items.length > 0 && (
//           <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
//             {cart.items.length}
//           </span>
//         )}
//       </button>

//       {/* Drawer */}
//       <AnimatePresence>
//         {open && (
//           <>
//             {/* Backdrop */}
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 0.5 }}
//               exit={{ opacity: 0 }}
//               transition={{ duration: 0.3 }}
//               className="fixed inset-0 bg-black z-40"
//               onClick={() => setOpen(false)}
//             />

//             {/* Drawer Content */}
//             <motion.div
//               initial={{ x: "100%" }}
//               animate={{ x: 0 }}
//               exit={{ x: "100%" }}
//               transition={{ type: "spring", stiffness: 120, damping: 20 }}
//               className="fixed top-0 right-0 w-[22rem] h-screen bg-white shadow-2xl z-50 overflow-y-auto rounded-l-2xl"
//             >
//               {/* Header */}
//               <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
//                 <h2 className="text-xl font-semibold text-gray-800">My Cart</h2>
//                 <button
//                   onClick={() => setOpen(false)}
//                   aria-label="Close Cart"
//                   className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
//                 >
//                   <X className="w-6 h-6" />
//                 </button>
//               </div>

//               {/* Cart Items */}
//               <div className="p-4">
//                 {!cart ? (
//                   <p>Loading cart...</p>
//                 ) : cart.items.length === 0 ? (
//                   <p>Your cart is empty</p>
//                 ) : (
//                   <ul className="space-y-4">
//                     {cart.items.map((item) => (
//                       <li
//                         key={item.id}
//                         className="flex gap-4 items-center border p-2 rounded-lg"
//                       >
//                         <Image
//                           src={item.product.imageUrl}
//                           alt={item.product.title}
//                           width={60}
//                           height={60}
//                           className="rounded"
//                         />
//                         <div className="flex-1">
//                           <h3 className="text-lg font-medium">{item.product.title}</h3>
//                           {item.variant?.name && (
//                             <p className="text-sm text-gray-500">{item.variant.name}</p>
//                           )}
//                           <span className="text-sm font-semibold">${item.unitPrice}</span>
//                           <div className="text-sm">Qty: {item.qty}</div>
//                         </div>
//                       </li>
//                     ))}
//                   </ul>
//                 )}
//               </div>

//               {/* Footer */}
//               <div className="p-4 border-t border-gray-200">
//                 <Link
//                   href="/cart"
//                   className="block w-full text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
//                 >
//                   Go to Cart Page
//                 </Link>
//               </div>
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }



"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, X } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSessionContext } from "@/app/_context/useSessionContext";

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

export default function CartDrawer() {
  const { session, status } = useSessionContext();
  const [cart, setCart] = useState<Cart | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetch("/api/cart")
        .then((res) => res.json())
        .then(async (data) => {
          const guestCart = localStorage.getItem("guestCart");
          if (guestCart) {
            await fetch("/api/cart/merge", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: guestCart,
            });
            localStorage.removeItem("guestCart");
            const merged = await fetch("/api/cart").then((r) => r.json());
            setCart(merged);
          } else {
            setCart(data);
          }
        })
        .catch(console.error);
    } else if (status === "unauthenticated") {
      const guestCart = localStorage.getItem("guestCart");
      if (guestCart) {
        setCart(JSON.parse(guestCart));
      } else {
        setCart({ id: null, userId: null, items: [] });
      }
    }
  }, [status, session]);

  useEffect(() => {
    if (status === "unauthenticated" && cart) {
      localStorage.setItem("guestCart", JSON.stringify(cart));
    }
  }, [cart, status]);

  return (
    <div>
      {/* Cart Icon + Label */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open Cart"
        className="flex items-center gap-2 relative text-gray-800 hover:text-blue-600 transition-colors duration-200"
      >
        <ShoppingCart className="w-8 h-8 text-brand-primary" />
        <span className="text-sm font-medium">Cart</span>
        {cart && cart.items.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
            {cart.items.length}
          </span>
        )}
      </button>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setOpen(false)}
            />

            {/* Drawer Content */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
              className="fixed top-0 right-0 w-[22rem] h-screen bg-white shadow-2xl z-50 overflow-y-auto rounded-l-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h2 className="text-xl font-semibold text-gray-800">My Cart</h2>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close Cart"
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="p-6">
                {!cart ? (
                  <p>Loading cart...</p>
                ) : cart.items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center space-y-4">
                    {/* Empty Cart Illustration */}
                    <Image
                      src="/images/empty-shopping-cart.png" // 👉 place an illustration in your public/images folder
                      alt="Empty Cart"
                      width={120}
                      height={120}
                      className="opacity-80"
                    />
                    <p className="text-gray-600 text-lg font-medium">
                      Your cart is empty
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {cart.items.map((item) => (
                      <li
                        key={item.id}
                        className="flex gap-4 items-center border p-2 rounded-lg"
                      >
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.title}
                          width={60}
                          height={60}
                          className="rounded"
                        />
                        <div className="flex-1">
                          <h3 className="text-lg font-medium">{item.product.title}</h3>
                          {item.variant?.name && (
                            <p className="text-sm text-gray-500">{item.variant.name}</p>
                          )}
                          <span className="text-sm font-semibold">${item.unitPrice}</span>
                          <div className="text-sm">Qty: {item.qty}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200">
                <Link
                  href="/cart"
                  className="block w-full text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                >
                  Go to Cart Page
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

