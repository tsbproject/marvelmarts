// import { createSlice, createSelector, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
// import { RootState } from "./index";

// interface ProductState {
//   items: any[];
//   total: number;
//   loading: boolean;
//   error: string | null;
//   isAllSelected: boolean; 
// }

// const initialState: ProductState = {
//   items: [],
//   total: 0,
//   loading: false,
//   error: null,
//   isAllSelected: false,
// };

// // --- ASYNC THUNKS ---

// /**
//  * Handles dynamic grouping by toggling boolean flags in the DB.
//  * The backend API now returns a success response after flipping the bits.
//  */
// export const bulkUpdateProductGroup = createAsyncThunk(
//   "products/bulkUpdateGroup",
//   async ({ ids, updateType }: { ids: string[]; updateType: string }, { rejectWithValue }) => {
//     try {
//       const response = await fetch("/api/products/bulk-update", {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ ids, updateType }),
//       });
//       const data = await response.json();
//       if (!response.ok) throw new Error(data.message || "Failed to update grouping");
      
//       // We return the original payload to update the Redux state locally
//       return { ids, updateType };
//     } catch (err: any) {
//       return rejectWithValue(err.message);
//     }
//   }
// );

// const productSlice = createSlice({
//   name: "products",
//   initialState,
//   reducers: {
//     setProducts: (state, action: PayloadAction<{ items: any[]; total: number }>) => {
//       state.items = action.payload.items;
//       state.total = action.payload.total;
//     },
//     setLoading: (state, action: PayloadAction<boolean>) => {
//       state.loading = action.payload;
//     },
//     setError: (state, action: PayloadAction<string | null>) => {
//       state.error = action.payload;
      
//     },
//     toggleSelectAllGlobal: (state, action: PayloadAction<boolean>) => {
//       state.isAllSelected = action.payload;
//     },

//     resetSelection: (state) => {
//       state.isAllSelected = false;
//     }
//   },
//   extraReducers: (builder) => {
//     builder

     
//       .addCase(bulkUpdateProductGroup.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(bulkUpdateProductGroup.fulfilled, (state, action) => {
//         state.loading = false;
//         const { ids, updateType } = action.payload;
        

//         // Map "isNew" to the actual database field "isNewArrival"
//         const targetField = updateType === "isNew" ? "isNewArrival" : updateType;

//         // TOGGLE LOGIC: Flip the boolean for all selected IDs
//         state.items = state.items.map((item) =>
//           ids.includes(item.id) 
//             ? { ...item, [targetField]: !item[targetField] } 
//             : item
//         );
//       })
//       .addCase(bulkUpdateProductGroup.fulfilled, (state, action) => {
//         state.loading = false;
//         state.isAllSelected = false; // Reset after successful update
//         // ... existing toggle logic for items in current view
//       });
//   },
// });

// export const { setProducts, setLoading, setError } = productSlice.actions;

// // --- SELECTORS ---

// const selectProductState = (state: RootState) => state.products;

// export const selectAllProducts = createSelector(
//   [selectProductState],
//   (productState) => productState.items || []
// );

// // 1. Featured Products: explicitly filtered by isFeatured flag
// export const selectFeaturedProducts = createSelector(
//   [selectAllProducts],
//   (products) => products.filter((p) => p.isFeatured).slice(0, 12)
// );

// // 2. New Arrivals: Hand-picked via isNewArrival OR recently created (last 7 days)
// export const selectNewArrivals = createSelector(
//   [selectAllProducts],
//   (products) =>
//     [...products]
//       .filter((p) => {
//         const isRecent = new Date(p.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000;
//         return p.isNewArrival || isRecent;
//       })
//       .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
//       .slice(0, 8)
// );

// // 3. Flash Products: Explicitly filtered by the isFlashSale flag
// export const selectFlashProducts = createSelector(
//   [selectAllProducts],
//   (products) => products.filter((p) => p.isFlashSale).slice(0, 4)
// );

// export default productSlice.reducer;




import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

interface BulkUpdatePayload {
  ids: string[];
  updateType: string;
  applyToAll?: boolean;
  filters?: {
    search: string;
    searchType: string;
    filter: string;
  };
}

export const bulkUpdateProductGroup = createAsyncThunk(
  "products/bulkUpdateGroup",
  async (payload: BulkUpdatePayload, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/products/bulk-update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message);
      
      return { 
        updateType: payload.updateType, 
        affectedIds: data.affectedIds 
      };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const productSlice = createSlice({
  name: "products",
  initialState: {
    items: [] as any[],
    total: 0,
    loading: false,
    error: null as string | null,
  },
  reducers: {
    setProducts: (state, action) => {
      state.items = action.payload.items;
      state.total = action.payload.total;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bulkUpdateProductGroup.pending, (state) => {
        state.loading = true;
      })
      .addCase(bulkUpdateProductGroup.fulfilled, (state, action) => {
        state.loading = false;
        const { updateType, affectedIds } = action.payload;

        const fieldMapping: Record<string, string> = {
          isFeatured: "isFeatured",
          isFlashSale: "isFlashSale",
          isNew: "isNewArrival",
          isNewArrival: "isNewArrival",
          status: "status" // For status updates
        };
        const dbField = fieldMapping[updateType];

        state.items = state.items.map((item) => {
          if (affectedIds.includes(item.id)) {
            // If it's a boolean toggle
            if (typeof item[dbField] === "boolean") {
              return { ...item, [dbField]: !item[dbField] };
            }
          }
          return item;
        });
      })
      .addCase(bulkUpdateProductGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setProducts, setLoading } = productSlice.actions;
export default productSlice.reducer;