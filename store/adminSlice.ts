// import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// interface AdminReview {
//   id: string;
//   rating: number;
//   body: string | null;
//   approved: boolean;
//   isVerified: boolean;
//   createdAt: string;
//   product: { title: string };
//   user: { name: string | null; email: string | null };
// }

// interface AdminState {
//   reviews: AdminReview[];
//   loading: boolean;
//   error: string | null;
// }

// const initialState: AdminState = {
//   reviews: [],
//   loading: false,
//   error: null,
// };

// const adminSlice = createSlice({
//   name: "admin",
//   initialState,
//   reducers: {
//     setAdminReviews: (state, action: PayloadAction<AdminReview[]>) => {
//       state.reviews = action.payload;
//     },
//     updateReviewStatus: (state, action: PayloadAction<{ id: string; approved: boolean }>) => {
//       const review = state.reviews.find((r) => r.id === action.id);
//       if (review) {
//         review.approved = action.payload.approved;
//       }
//     },
//     deleteAdminReview: (state, action: PayloadAction<string>) => {
//       state.reviews = state.reviews.filter((r) => r.id !== action.payload);
//     },
//     setAdminLoading: (state, action: PayloadAction<boolean>) => {
//       state.loading = action.payload;
//     },

//         bulkDeleteReviews: (state, action: PayloadAction<string[]>) => {
//     state.reviews = state.reviews.filter((r) => !action.payload.includes(r.id));
//     },

//     bulkUpdateStatus: (state, action: PayloadAction<{ ids: string[]; approved: boolean }>) => {
//   state.reviews = state.reviews.map((r) =>
//     action.payload.ids.includes(r.id) 
//       ? { ...r, approved: action.payload.approved } 
//       : r
//   );
// },


//   },
// });

// export const { 
//   setAdminReviews, 
//   updateReviewStatus, 
//   deleteAdminReview, 
//   setAdminLoading,
//   bulkUpdateStatus 
// } = adminSlice.actions;

// export default adminSlice.reducer;



import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AdminReview {
  id: string;
  rating: number;
  body: string | null;
  approved: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string; 
  product: { title: string };
  user: { name: string | null; email: string | null };
}

interface AdminState {
  reviews: AdminReview[];
  searchTerm: string;      // Tactical Search
  currentPage: number;     // Pagination State
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  reviews: [],
  searchTerm: "",
  currentPage: 1,
  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    // --- Data Hydration ---
    setAdminReviews: (state, action: PayloadAction<AdminReview[]>) => {
      state.reviews = action.payload;
    },

    // --- Search & Pagination Logic ---
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
      state.currentPage = 1; // Reset to page 1 when searching
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    
    // --- Individual Actions ---
    updateReviewStatus: (state, action: PayloadAction<{ id: string; approved: boolean }>) => {
      const review = state.reviews.find((r) => r.id === action.payload.id);
      if (review) {
        review.approved = action.payload.approved;
      }
    },
    deleteAdminReview: (state, action: PayloadAction<string>) => {
      state.reviews = state.reviews.filter((r) => r.id !== action.payload);
    },

    // --- Bulk Tactical Operations ---
    bulkDeleteReviews: (state, action: PayloadAction<string[]>) => {
      state.reviews = state.reviews.filter((r) => !action.payload.includes(r.id));
    },
    bulkUpdateStatus: (state, action: PayloadAction<{ ids: string[]; approved: boolean }>) => {
      state.reviews = state.reviews.map((r) =>
        action.payload.ids.includes(r.id) 
          ? { ...r, approved: action.payload.approved } 
          : r
      );
    },

    setAdminLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

// All actions exported for use in AdminReviewManager
export const { 
  setAdminReviews, 
  setSearchTerm,
  setCurrentPage,
  updateReviewStatus, 
  deleteAdminReview, 
  setAdminLoading,
  bulkUpdateStatus,
  bulkDeleteReviews 
} = adminSlice.actions;

export default adminSlice.reducer;