import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

interface VendorData {
  id: string;
  storeName: string;
  _count?: { products: number };
  // Add other fields based on your Prisma model
}

interface ChatState {
  activeConversationId: string | null;
  selectedVendor: VendorData | null;
  loadingVendor: boolean;
}

const initialState: ChatState = {
  activeConversationId: null,
  selectedVendor: null,
  loadingVendor: false,
};

// ASYNC THUNK: Fetches vendor details from the API we just discussed
export const fetchVendorDetails = createAsyncThunk(
  "chat/fetchVendorDetails",
  async (vendorProfileId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/admins/vendors/${vendorProfileId}`);
      if (!response.ok) throw new Error("Failed to fetch vendor");
      return await response.json();
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setActiveConversation: (state, action: PayloadAction<string>) => {
      state.activeConversationId = action.payload;
    },
    clearSelectedVendor: (state) => {
      state.selectedVendor = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVendorDetails.pending, (state) => {
        state.loadingVendor = true;
      })
      .addCase(fetchVendorDetails.fulfilled, (state, action) => {
        state.loadingVendor = false;
        state.selectedVendor = action.payload;
      })
      .addCase(fetchVendorDetails.rejected, (state) => {
        state.loadingVendor = false;
        state.selectedVendor = null;
      });
  },
});

export const { setActiveConversation, clearSelectedVendor } = chatSlice.actions;
export default chatSlice.reducer;