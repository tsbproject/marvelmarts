// import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import { SerializedProduct } from "@/types/product";

// export interface CartItem {
//   id: string; // Keep consistent with SerializedProduct
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

// // Initial state starts empty to prevent Next.js hydration mismatches
// const initialState: CartState = {
//   items: [],
// };

// const cartSlice = createSlice({
//   name: "cart",
//   initialState,
//   reducers: {
//     // 1. HYDRATION: Syncs state from localStorage on mount
//     hydrateCart: (state, action: PayloadAction<CartItem[]>) => {
//       state.items = action.payload;
//     },

//     // 2. ADD TO CART: Distinguishes between base products and specific variants
//     addToCart: (
//       state, 
//       action: PayloadAction<{ 
//         product: SerializedProduct & { variantId?: string | null; variantName?: string }; 
//         quantity: number 
//       }>
//     ) => {
//       const { product, quantity } = action.payload;
//       const incomingVariantId = product.variantId ?? null;

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
//           // Prefers discount price if available, converted to a clean Number
//           price: Number(product.discountPrice ?? product.price),
//           imageUrl: product.imageUrl || "/logo.png",
//           quantity,
//           variantName: product.variantName,
//         });
//       }
      
//       // Persist to localStorage
//       if (typeof window !== "undefined") {
//         localStorage.setItem("marvel_cart", JSON.stringify(state.items));
//       }
//     },

//     // 3. UPDATE QUANTITY: Fixed the 'i.i' typo to 'i.id'
//     updateQuantity: (
//       state, 
//       action: PayloadAction<{ id: string; variantId?: string | null; quantity: number }>
//     ) => {
//       const targetVariantId = action.payload.variantId ?? null;
      
//       const item = state.items.find(
//         (i) => i.id === action.payload.id && i.variantId === targetVariantId
//       );
      
//       if (item && action.payload.quantity > 0) {
//         item.quantity = action.payload.quantity;
//       }
      
//       if (typeof window !== "undefined") {
//         localStorage.setItem("marvel_cart", JSON.stringify(state.items));
//       }
//     },

//     // 4. REMOVE ITEM: Filters out the specific product/variant combo
//     removeFromCart: (
//       state, 
//       action: PayloadAction<{ id: string; variantId?: string | null }>
//     ) => {
//       const targetVariantId = action.payload.variantId ?? null;

//       state.items = state.items.filter(
//         (item) => !(item.id === action.payload.id && item.variantId === targetVariantId)
//       );
      
//       if (typeof window !== "undefined") {
//         localStorage.setItem("marvel_cart", JSON.stringify(state.items));
//       }
//     },

//     // 5. CLEAR CART: Wipes state and local storage
//     clearCart: (state) => {
//       state.items = [];
//       if (typeof window !== "undefined") {
//         localStorage.removeItem("marvel_cart");
//       }
//     },
//   },
// });

// // Export actions for use in components
// export const { 
//   hydrateCart, 
//   addToCart, 
//   removeFromCart, 
//   updateQuantity, 
//   clearCart 
// } = cartSlice.actions;

// export default cartSlice.reducer;




import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SerializedProduct } from "@/types/product";

export interface CartItem {
  id: string; // Product ID
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

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // 1. HYDRATION: Syncs state from localStorage
    hydrateCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
    },

    // 2. ADD TO CART
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
          price: Number(product.discountPrice ?? product.price),
          imageUrl: product.imageUrl || "/logo.png",
          quantity,
          variantName: product.variantName,
        });
      }
      
      if (typeof window !== "undefined") {
        localStorage.setItem("marvel_cart", JSON.stringify(state.items));
      }
    },

    // 3. UPDATE QUANTITY
    updateQuantity: (
      state, 
      action: PayloadAction<{ id: string; variantId?: string | null; quantity: number }>
    ) => {
      const targetVariantId = action.payload.variantId ?? null;
      
      const item = state.items.find(
        (i) => i.id === action.payload.id && i.variantId === targetVariantId
      );
      
      if (item && action.payload.quantity > 0) {
        item.quantity = action.payload.quantity;
      }
      
      if (typeof window !== "undefined") {
        localStorage.setItem("marvel_cart", JSON.stringify(state.items));
      }
    },

    // 4. REMOVE ITEM: Refined to handle both Object and String payloads
    removeFromCart: (
      state, 
      action: PayloadAction<{ id: string; variantId?: string | null } | string>
    ) => {
      if (typeof action.payload === "string") {
        // If just an ID string is passed
        state.items = state.items.filter((item) => item.id !== action.payload);
      } else {
        // If a specific product/variant combo is passed
        const { id, variantId } = action.payload;
        const targetVariantId = variantId ?? null;
        state.items = state.items.filter(
          (item) => !(item.id === id && item.variantId === targetVariantId)
        );
      }
      
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

export const { 
  hydrateCart, 
  addToCart, 
  removeFromCart, 
  updateQuantity, 
  clearCart 
} = cartSlice.actions;

export default cartSlice.reducer;