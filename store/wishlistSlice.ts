


import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/**
 * Updated interface to match your Prisma model and component needs.
 * This prevents the "missing title/imageUrl" build errors on Vercel.
 */
export interface WishlistItem {
  id: string;
  productId: string;
  title: string;
  imageUrl: string;
  price: number;
  slug: string;
  categoryName?: string; // Add this line here!
}
interface WishlistState {
  items: WishlistItem[];
  loading: boolean;
  error: string | null;
}

const initialState: WishlistState = {
  items: [],
  loading: false,
  error: null,
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    // Syncs the Redux store with the database response
    setWishlist: (state, action: PayloadAction<WishlistItem[]>) => {
      state.items = action.payload;
      state.loading = false;
    },

    /**
     * Toggles an item in the wishlist.
     * Checks for existence using both productId and the database record id.
     */
    toggleWishlist: (state, action: PayloadAction<WishlistItem>) => {
      const exists = state.items.find(
        (item) => 
          item.productId === action.payload.productId || 
          (action.payload.id && item.id === action.payload.id)
      );

      if (exists) {
        state.items = state.items.filter(
          (item) => 
            item.productId !== action.payload.productId && 
            item.id !== action.payload.id
        );
      } else {
        // Add new items to the top of the list
        state.items.unshift(action.payload);
      }
    },

    /**
     * Specific action for the Wishlist Page "Trash" button.
     * Uses a broad filter to ensure the item is removed regardless of which ID is passed.
     */
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (item) => item.id !== action.payload && item.productId !== action.payload
      );
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    }
  },
});

export const { 
  toggleWishlist, 
  setWishlist, 
  removeFromWishlist, 
  setLoading, 
  setError 
} = wishlistSlice.actions;

export default wishlistSlice.reducer;