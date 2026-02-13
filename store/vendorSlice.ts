import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number; // Mapped from 'total' decimal in API
  status: "PENDING" | "APPROVED" | "REJECTED";
  trackingNumber?: string | null;
  paymentStatus: boolean;
  createdAt: string;
  items: any[];
}

interface Onboarding {
  profileDone: boolean;
  storeDone: boolean;
  productDone: boolean;
}

interface VendorState {
  profile: any | null; // Added to track profile & onboarding
  onboarding: Onboarding | null; // Added
  orders: Order[];
  loading: boolean;
  error: string | null;
}

const initialState: VendorState = {
  profile: null,
  onboarding: null,
  orders: [],
  loading: false,
  error: null,
};

interface VendorState {
  orders: Order[];
  loading: boolean;
  error: string | null;
}


// FETCH ORDERS - Focused on VendorProfile context
export const fetchVendorOrders = createAsyncThunk(
  "vendor/fetchOrders",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/vendors/orders");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch orders");
    }
  }
);

// MERGED UPDATE ACTION (Approve/Reject + Tracking)
export const updateOrderStatus = createAsyncThunk(
  "vendor/updateStatus",
  async (
    { orderId, status, trackingNumber }: { orderId: string; status: "APPROVED" | "REJECTED"; trackingNumber?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.patch(`/api/vendors/orders/${orderId}`, { 
        status, 
        trackingNumber 
      });
      
      // We return exactly what the DB updated
      return { 
        orderId, 
        status: response.data.status, 
        trackingNumber: response.data.trackingNumber 
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Update failed");
    }
  }
);

const vendorSlice = createSlice({
  name: "vendor",
  initialState,
  reducers: {
    // Optional: Clear error state manually
    clearVendorError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetching Logic
      .addCase(fetchVendorOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVendorOrders.fulfilled, (state, action: PayloadAction<Order[]>) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchVendorOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Merged Update Logic (Handles Approve/Reject/Tracking sync)
      .addCase(updateOrderStatus.pending, (state) => {
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.orders.findIndex((o) => o.id === action.payload.orderId);
        if (index !== -1) {
          // Sync both status and tracking number to the local store
          state.orders[index].status = action.payload.status;
          if (action.payload.trackingNumber) {
            state.orders[index].trackingNumber = action.payload.trackingNumber;
          }
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearVendorError } = vendorSlice.actions;
export default vendorSlice.reducer;