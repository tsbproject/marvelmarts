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
  shippingMethod?: string | null;
  vendorProfileId?: string;
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
            price: Number(product.discountPrice != null && Number(product.discountPrice) > 0 ? product.discountPrice : product.price),
            imageUrl:
              product.imageUrl ||
              product.images?.[0]?.url ||
              "/placeholder-product.png",
            quantity,
            variantName: product.variantName,
            shippingMethod: product.shippingMethod ?? null,
            vendorProfileId: product.vendorProfileId,
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

