



import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

// 1. Unified Interfaces
interface Onboarding {
  profileDone: boolean;
  storeDone: boolean;
  productDone: boolean;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  trackingNumber?: string | null;
  paymentStatus: boolean;
  createdAt: string;
  items: any[];
}

interface Vendor {
  id: string;
  storeName: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  isSuspended: boolean;
  user: {
    email: string;
    name: string;
  };
}

interface VendorState {
  profile: any | null;
  onboarding: Onboarding | null;
  orders: Order[];
  vendors: Vendor[]; 
  // Search, Filter & Pagination State
  searchQuery: string;
  statusFilter: "ALL" | "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  pagination: {
    currentPage: number;
    itemsPerPage: number;
  };
  loading: boolean;
  error: string | null;
}

const initialState: VendorState = {
  profile: null,
  onboarding: null,
  orders: [],
  vendors: [],
  searchQuery: "",
  statusFilter: "ALL",
  pagination: {
    currentPage: 1,
    itemsPerPage: 10,
  },
  loading: false,
  error: null,
};

// --- ASYNC THUNKS ---

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

// --- THE SLICE ---

const vendorSlice = createSlice({
  name: "vendor",
  initialState,
  reducers: {
    setVendorData: (state, action: PayloadAction<{ profile: any; onboarding: Onboarding }>) => {
      state.profile = action.payload.profile;
      state.onboarding = action.payload.onboarding;
    },
    setAllVendors: (state, action: PayloadAction<Vendor[]>) => {
      state.vendors = action.payload;
    },
    // Search & Filter & Pagination Reducers
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.pagination.currentPage = 1; // Reset to page 1 on new search
    },
    setStatusFilter: (state, action: PayloadAction<VendorState["statusFilter"]>) => {
      state.statusFilter = action.payload;
      state.pagination.currentPage = 1; // Reset to page 1 on filter change
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.pagination.currentPage = action.payload;
    },
    setItemsPerPage: (state, action: PayloadAction<number>) => {
      state.pagination.itemsPerPage = action.payload;
      state.pagination.currentPage = 1;
    },
    // Merged Status Update
    updateVendorStatusInStore: (state, action: PayloadAction<{ 
      vendorId: string; 
      status?: "PENDING" | "APPROVED" | "REJECTED"; 
      isSuspended?: boolean;
      action?: "APPROVE" | "REJECT" | "SUSPEND" | "UNSUSPEND" | "DELETE"
    }>) => {
      const { vendorId, action: act, status, isSuspended } = action.payload;
      
      if (act === "DELETE") {
        state.vendors = state.vendors.filter(v => v.id !== vendorId);
        return;
      }

      const vendor = state.vendors.find(v => v.id === vendorId);
      if (vendor) {
        if (act === "APPROVE") { vendor.status = "APPROVED"; vendor.isSuspended = false; }
        if (act === "REJECT") { vendor.status = "REJECTED"; }
        if (act === "SUSPEND") { vendor.isSuspended = true; }
        if (act === "UNSUSPEND") { vendor.isSuspended = false; }
        
        if (status) vendor.status = status;
        if (isSuspended !== undefined) vendor.isSuspended = isSuspended;
      }
    },
    clearVendorError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
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
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.orders.findIndex((o) => o.id === action.payload.orderId);
        if (index !== -1) {
          state.orders[index].status = action.payload.status;
          if (action.payload.trackingNumber) {
            state.orders[index].trackingNumber = action.payload.trackingNumber;
          }
        }
      });
  },
});

export const { 
  clearVendorError, 
  setVendorData, 
  setAllVendors, 
  updateVendorStatusInStore,
  setSearchQuery,
  setStatusFilter,
  setCurrentPage,
  setItemsPerPage
} = vendorSlice.actions;

export default vendorSlice.reducer;