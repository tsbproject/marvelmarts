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