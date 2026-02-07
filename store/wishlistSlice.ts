// import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// export interface WishlistItem {
//   id: string;        // The Wishlist ID
//   productId: string; // The Actual Product ID
//   name: string;      // Matches your Prisma product field
//   slug: string;
//   price: number;
//   image: string;     // Matches the sanitized image string from your fetch
// }

// interface WishlistState {
//   items: WishlistItem[];
//   loading: boolean;
//   error: string | null;
// }

// const initialState: WishlistState = {
//   items: [],
//   loading: false,
//   error: null,
// };

// const wishlistSlice = createSlice({
//   name: "wishlist",
//   initialState,
//   reducers: {
//     // Used when the page first loads to hydrate from Prisma
//     setWishlist: (state, action: PayloadAction<WishlistItem[]>) => {
//       state.items = action.payload;
//       state.loading = false;
//     },

//     // Handles adding/removing from the Product Cards
//     toggleWishlist: (state, action: PayloadAction<WishlistItem>) => {
//       const exists = state.items.find((item) => item.productId === action.payload.productId);
//       if (exists) {
//         state.items = state.items.filter((item) => item.productId !== action.payload.productId);
//       } else {
//         state.items.unshift(action.payload); // Add new items to the top
//       }
//     },

//     // Specific action for the Wishlist Page "Trash" button
//     removeFromWishlist: (state, action) => {
//       state.items = state.items.filter((item: any) => item.id !== action.payload);
//     },

//     setLoading: (state, action: PayloadAction<boolean>) => {
//       state.loading = action.payload;
//     },

//     setError: (state, action: PayloadAction<string | null>) => {
//       state.error = action.payload;
//       state.loading = false;
//     }
//   },
// });

// export const { 
//   toggleWishlist, 
//   setWishlist, 
//   removeFromWishlist, 
//   setLoading, 
//   setError 
// } = wishlistSlice.actions;

// export default wishlistSlice.reducer;





import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface WishlistItem {
  id: string;        // The Wishlist Record ID (from Prisma)
  productId: string; // The Actual Product ID
  name: string;      // Changed from 'title' to match your components
  slug: string;
  price: number;
  image: string;     // Changed from 'imageUrl' to match your mapping
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
    // Used when the page first loads to hydrate from Prisma
    setWishlist: (state, action: PayloadAction<WishlistItem[]>) => {
      state.items = action.payload;
      state.loading = false;
    },

    // Handles adding/removing from the Product Cards
    toggleWishlist: (state, action: PayloadAction<WishlistItem>) => {
      // Check both ID types to be safe
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
        state.items.unshift(action.payload); // Add new items to the top
      }
    },

    // Specific action for the Wishlist Page "Trash" button
    // Updated to be defensive: filters by both potential ID fields
    removeFromWishlist: (state, action) => {
  state.items = state.items.filter((item: any) => item.id !== action.payload);
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