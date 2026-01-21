import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CartItem {
  id: string | number;
  slug: string;
  title: string;
  price: number;
  imageUrl: string;
  quantity: number;
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
      const existingItem = state.items.find((item) => item.id === product.id);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          id: product.id,
          slug: product.slug,
          title: product.title,
          price: product.price,
          imageUrl: product.images?.[0]?.url || "/images/placeholder.jpg",
          quantity,
        });
      }
      localStorage.setItem("marvel_cart", JSON.stringify(state.items));
    },
    removeFromCart: (state, action: PayloadAction<string | number>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      localStorage.setItem("marvel_cart", JSON.stringify(state.items));
    },
    clearCart: (state) => {
      state.items = [];
      localStorage.removeItem("marvel_cart");
    },
  },
});

export const { addToCart, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;