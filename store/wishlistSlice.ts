import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface WishlistItem {
  id: string;
  title: string;
  slug: string;
  price: number;
  imageUrl: string;
}

interface WishlistState {
  items: WishlistItem[];
}

const initialState: WishlistState = {
  items: [],
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    toggleWishlist: (state, action: PayloadAction<WishlistItem>) => {
      const exists = state.items.find((item) => item.id === action.payload.id);
      if (exists) {
        state.items = state.items.filter((item) => item.id !== action.payload.id);
      } else {
        state.items.push(action.payload);
      }
    },
    setWishlist: (state, action: PayloadAction<WishlistItem[]>) => {
      state.items = action.payload;
    },
  },
});

export const { toggleWishlist, setWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;