// lib/store/features/trending/trendingSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Product {
  id: string;
  name: string;
  isTrending: boolean;
  imageUrl?: string;
}

interface TrendingState {
  items: Product[];
  loading: boolean;
}

const initialState: TrendingState = {
  items: [],
  loading: false,
};

const trendingSlice = createSlice({
  name: 'trending',
  initialState,
  reducers: {
    setTrendingProducts: (state, action: PayloadAction<Product[]>) => {
      state.items = action.payload;
    },
    updateProductTrendingStatus: (state, action: PayloadAction<{ id: string; status: boolean }>) => {
    const product = state.items.find(p => p.id === action.payload.id);
      if (product) {
        product.isTrending = action.payload.status;
      }
    }
  },
});

export const { setTrendingProducts, updateProductTrendingStatus } = trendingSlice.actions;
export default trendingSlice.reducer;