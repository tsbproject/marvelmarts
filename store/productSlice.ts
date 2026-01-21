import { createSlice, createSelector, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

interface ProductState {
  items: any[];
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  items: [],
  loading: false,
  error: null,
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<any[]>) => {
      state.items = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setProducts, setLoading } = productSlice.actions;

// --- FIXED SELECTORS ---

// 1. Base selector to get the slice state safely
const selectProductState = (state: RootState) => state.products;

// 2. Input selector to get items
const selectAllProducts = createSelector(
  [selectProductState],
  (productState) => productState.items || []
);

// 3. Sync Featured: Hand-picked items
export const selectFeaturedProducts = createSelector(
  [selectAllProducts],
  (products) => products.filter((p) => p.isFeatured).slice(0, 4)
);

// 4. Sync New Arrivals: Sort by date created
export const selectNewArrivals = createSelector(
  [selectAllProducts],
  (products) => [...products]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8)
);

// 5. Sync Flash Products: Any product with a discount price > 0
export const selectFlashProducts = createSelector(
  [selectAllProducts],
  (products) => products.filter((p) => p.discountPrice && p.discountPrice > 0).slice(0, 4)
);

export default productSlice.reducer;