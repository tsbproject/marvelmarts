// import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// interface CartItem {
//   id: string | number;
//   variantId: string | null; 
//   slug: string;
//   title: string;
//   price: number;
//   imageUrl: string;
//   quantity: number;
//   variantName?: string;
// }

// interface CartState {
//   items: CartItem[];
// }

// const initialState: CartState = {
//   items: typeof window !== "undefined" ? JSON.parse(localStorage.getItem("marvel_cart") || "[]") : [],
// };

// const cartSlice = createSlice({
//   name: "cart",
//   initialState,
//   reducers: {
//     addToCart: (state, action: PayloadAction<{ product: any; quantity: number }>) => {
//       const { product, quantity } = action.payload;
      
//       // NORMALIZATION: Ensure variantId is always a string or null (never undefined)
//       const incomingVariantId = product.variantId ?? null;

//       // Strict find: check both ID and the normalized variantId
//       const existingItem = state.items.find(
//         (item) => item.id === product.id && item.variantId === incomingVariantId
//       );
      
//       if (existingItem) {
//         existingItem.quantity += quantity;
//       } else {
//         state.items.push({
//           id: product.id,
//           variantId: incomingVariantId,
//           slug: product.slug,
//           title: product.title,
//           price: product.price,
//           imageUrl: product.imageUrl || product.images?.[0]?.url || "/logo.png",
//           quantity,
//           variantName: product.variantName,
//         });
//       }
//       localStorage.setItem("marvel_cart", JSON.stringify(state.items));
//     },

//     updateQuantity: (state, action: PayloadAction<{ id: string | number; variantId?: string | null; quantity: number }>) => {
//       const targetVariantId = action.payload.variantId ?? null;
      
//       const item = state.items.find(
//         (i) => i.id === action.payload.id && i.variantId === targetVariantId
//       );
      
//       if (item) {
//         item.quantity = action.payload.quantity;
//       }
//       localStorage.setItem("marvel_cart", JSON.stringify(state.items));
//     },

//     removeFromCart: (state, action: PayloadAction<{ id: string | number; variantId?: string | null }>) => {
//       const targetVariantId = action.payload.variantId ?? null;

//       state.items = state.items.filter(
//         (item) => !(item.id === action.payload.id && item.variantId === targetVariantId)
//       );
//       localStorage.setItem("marvel_cart", JSON.stringify(state.items));
//     },

//     clearCart: (state) => {
//       state.items = [];
//       localStorage.removeItem("marvel_cart");
//     },
//   },
// });

// export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
// export default cartSlice.reducer;






import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SerializedProduct } from "@/types/product";

export interface CartItem {
  id: string | number;
  variantId: string | null; 
  slug: string;
  title: string;
  price: number;
  imageUrl: string;
  quantity: number;
  variantName?: string;
}

interface CartState {
  items: CartItem[];
}

// We start with an empty array to avoid Next.js hydration mismatches.
// The CartHydrator component will populate this from localStorage on mount.
const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // 1. HYDRATION: Used to set the cart state from localStorage on page load
    hydrateCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
    },

    // 2. ADD TO CART: Handles both standard products and variants
    addToCart: (
      state, 
      action: PayloadAction<{ 
        product: SerializedProduct & { variantId?: string | null; variantName?: string }; 
        quantity: number 
      }>
    ) => {
      const { product, quantity } = action.payload;
      const incomingVariantId = product.variantId ?? null;

      const existingItem = state.items.find(
        (item) => item.id === product.id && item.variantId === incomingVariantId
      );
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          id: product.id,
          variantId: incomingVariantId,
          slug: product.slug,
          title: product.title,
          // Always use the discounted price if it exists
          price: Number(product.discountPrice || product.price),
          imageUrl: product.imageUrl || "/logo.png",
          quantity,
          variantName: product.variantName,
        });
      }
      
      // Update localStorage whenever the state changes
      if (typeof window !== "undefined") {
        localStorage.setItem("marvel_cart", JSON.stringify(state.items));
      }
    },

    // 3. UPDATE QUANTITY
    updateQuantity: (
      state, 
      action: PayloadAction<{ id: string | number; variantId?: string | null; quantity: number }>
    ) => {
      const targetVariantId = action.payload.variantId ?? null;
      
      const item = state.items.find(
        (i) => i.i === action.payload.id && i.variantId === targetVariantId
      );
      
      if (item && action.payload.quantity > 0) {
        item.quantity = action.payload.quantity;
      }
      
      if (typeof window !== "undefined") {
        localStorage.setItem("marvel_cart", JSON.stringify(state.items));
      }
    },

    // 4. REMOVE ITEM
    removeFromCart: (
      state, 
      action: PayloadAction<{ id: string | number; variantId?: string | null }>
    ) => {
      const targetVariantId = action.payload.variantId ?? null;

      state.items = state.items.filter(
        (item) => !(item.id === action.payload.id && item.variantId === targetVariantId)
      );
      
      if (typeof window !== "undefined") {
        localStorage.setItem("marvel_cart", JSON.stringify(state.items));
      }
    },

    // 5. CLEAR CART
    clearCart: (state) => {
      state.items = [];
      if (typeof window !== "undefined") {
        localStorage.removeItem("marvel_cart");
      }
    },
  },
});

// Export all actions
export const { 
  hydrateCart, 
  addToCart, 
  removeFromCart, 
  updateQuantity, 
  clearCart 
} = cartSlice.actions;

export default cartSlice.reducer;