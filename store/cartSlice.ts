import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CartItem {
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

const initialState: CartState = {
  items: typeof window !== "undefined" ? JSON.parse(localStorage.getItem("marvel_cart") || "[]") : [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{ product: any; quantity: number }>) => {
      const { product, quantity } = action.payload;
      
      // NORMALIZATION: Ensure variantId is always a string or null (never undefined)
      const incomingVariantId = product.variantId ?? null;

      // Strict find: check both ID and the normalized variantId
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
          price: product.price,
          imageUrl: product.imageUrl || product.images?.[0]?.url || "/logo.png",
          quantity,
          variantName: product.variantName,
        });
      }
      localStorage.setItem("marvel_cart", JSON.stringify(state.items));
    },

    updateQuantity: (state, action: PayloadAction<{ id: string | number; variantId?: string | null; quantity: number }>) => {
      const targetVariantId = action.payload.variantId ?? null;
      
      const item = state.items.find(
        (i) => i.id === action.payload.id && i.variantId === targetVariantId
      );
      
      if (item) {
        item.quantity = action.payload.quantity;
      }
      localStorage.setItem("marvel_cart", JSON.stringify(state.items));
    },

    removeFromCart: (state, action: PayloadAction<{ id: string | number; variantId?: string | null }>) => {
      const targetVariantId = action.payload.variantId ?? null;

      state.items = state.items.filter(
        (item) => !(item.id === action.payload.id && item.variantId === targetVariantId)
      );
      localStorage.setItem("marvel_cart", JSON.stringify(state.items));
    },

    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem("marvel_cart");
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;