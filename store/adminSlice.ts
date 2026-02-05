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

// New interface for Admin Users
interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  role: "ADMIN" | "SUPER_ADMIN";
  createdAt: string;
}

interface AdminState {
  admins: AdminUser[];     // Track Admin Users
  reviews: AdminReview[];
  searchTerm: string;      // Tactical Search
  currentPage: number;     // Pagination State
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  admins: [],
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
    // --- Admin User Management ---
    setAdmins: (state, action: PayloadAction<AdminUser[]>) => {
      state.admins = action.payload;
    },
    deleteAdmin: (state, action: PayloadAction<string>) => {
    state.admins = state.admins.filter((admin) => admin.id !== action.payload);
},

    // --- Review Data Hydration ---
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
    
    // --- Individual Review Actions ---
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

    // --- Global Helpers ---
    setAdminLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setAdminError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});



export const { 
  setAdmins,
  deleteAdmin,
  setAdminReviews, 
  setSearchTerm,
  setCurrentPage,
  updateReviewStatus, 
  deleteAdminReview, 
  setAdminLoading,
  setAdminError,
  bulkUpdateStatus,
  bulkDeleteReviews 
} = adminSlice.actions;

export default adminSlice.reducer;