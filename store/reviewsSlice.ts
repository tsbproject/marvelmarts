import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  body: string | null;
  approved: boolean;
  createdAt: string;
  user: { name: string | null };
}

interface ReviewsState {
  items: Review[];
  loading: boolean;
  error: string | null;
}

const initialState: ReviewsState = {
  items: [],
  loading: false,
  error: null,
};

// Tactical Thunk for Submitting Intel
export const submitReview = createAsyncThunk(
  "reviews/submit",
  async ({ productId, rating, comment }: { productId: string; rating: number; comment: string }, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, comment }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message || "Failed to transmit report.");
      }

      return await response.json();
    } catch (error: any) {
      return rejectWithValue("Network error: HQ is unreachable.");
    }
  }
);

const reviewsSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {
    // Used to load initial reviews from the server-side props
    setReviews: (state, action: PayloadAction<Review[]>) => {
      state.items = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitReview.fulfilled, (state, action: PayloadAction<Review>) => {
        state.loading = false;
        // Optimization: Push the new review to the top of the list immediately
        state.items.unshift(action.payload);
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setReviews } = reviewsSlice.actions;
export default reviewsSlice.reducer;