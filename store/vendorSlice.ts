import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

// --- Types ---
export type Onboarding = {
  profileDone: boolean;
  storeDone: boolean;
  productDone: boolean;
};

interface VendorProfile {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  balance: number;

  storeName?: string;
  bio?: string;
  logoUrl?: string;
  coverUrl?: string;
  

  instagram?: string;
  whatsapp?: string;

}



interface VendorState {
  credits: number;
  profile: any | null;
  onboarding: Onboarding;
  balance: number;
  lastSyncedAt: string | null;
  orders: any[];
  allPayouts: any[]; 
  payouts: any[]
  selectedOrder: null,

  // Admin Management Fields
  vendors: any[]; 
  searchQuery: string;
  statusFilter: string;
  currentPage: number;

  loading: boolean;
  error: string | null;
}


interface PayoutPayload {
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

interface ProcessPayoutPayload {
  requestId: string;
  status: "APPROVED" | "REJECTED";
  remarks: string;
}


export interface Payout {
  id: string;
  amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  accountName: string;
  accountNumber: string;
  bankName: string;
  adminRemarks?: string; 
  processedAt?: string;  
  createdAt: string;
  vendorName?: string;  
}
const initialState: VendorState = {
  credits: 0,
  profile: null,
  onboarding: {
    profileDone: false,
    storeDone: false,
    productDone: false,
  },

  vendors: [],
  searchQuery: "",
  statusFilter: "ALL",
  currentPage: 1,
 
  
  balance: 0,
  lastSyncedAt: null,
  orders: [],
  allPayouts: [],
  //  payouts: Payout[];
  payouts: [],
   selectedOrder: null,
  loading: false,
  error: null,
};

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;

}

// --- Thunks ---

/**
 * Admin Action: Fetches all payout requests across MarvelMarts.
 */

export const fetchOrderById = createAsyncThunk(
  "vendor/fetchOrderById",
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) throw new Error("Failed to fetch order");
      return await response.json();
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchVendorPayouts = createAsyncThunk(
  "vendor/fetchVendorPayouts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/vendors/payout"); 
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || "Failed to fetch payouts");
      
      // Return the array of payouts
      return data.payouts; 
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAdminPayouts = createAsyncThunk(
  "vendor/fetchAdminPayouts",
  async (_, { rejectWithValue }) => {
    try {
      // Create this API route next
      const response = await fetch("/api/admins/payouts");
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data.payouts;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);


export const processAdminPayout = createAsyncThunk(
  "vendor/processAdminPayout",
  async ({ requestId, action, remarks }: { requestId: string; action: "APPROVED" | "REJECTED"; remarks?: string }, { rejectWithValue }) => {
    try {
      // This calls the unified API we built earlier
      const response = await fetch(`/api/admins/payouts/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action, remarks }),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to process payout");
      }

      return { requestId, action, data };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);



export const updateVendorSettings = createAsyncThunk(
  "vendor/updateSettings",
  async (settingsData: any, { dispatch, rejectWithValue }) => {
    try {
      // settingsData should include: storeName, description, logoUrl, coverUrl, 
      // instagram, twitter, facebook, whatsapp, bankName, etc.
      const response = await axios.patch("/api/vendors/profile/settings", settingsData);
      
      const updatedProfile = response.data.profile;

      // Update the local Redux state immediately with the full profile data
      dispatch(setVendorData({
        profile: updatedProfile,
        onboarding: {
          // We pull these directly from the DB response to stay 100% accurate
          profileDone: updatedProfile.profileDone, 
          storeDone: updatedProfile.storeDone,
          productDone: updatedProfile.productDone || false,
        },
        // Ensures the balance (Decimal) is kept in sync for the dashboard
        balance: updatedProfile.balance,
      }));

      return response.data;
    } catch (error: any) {
      // Extract the most specific error message for NotifyError
      const errorMessage = error.response?.data?.message || "Failed to update settings";
      return rejectWithValue(errorMessage);
    }
  }
);



export const fetchAllPayouts = createAsyncThunk(
  "vendor/fetchAllPayouts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/admins/payouts");
      return response.data.payouts;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch payouts");
    }
  }
);

/**
 * Syncs profile, onboarding status, and current balance.
 */

export const fetchVendorProfile = createAsyncThunk(
  "vendor/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/vendors/profile");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to sync profile");
    }
  }
);

/**
 * Fetches vendor orders and pulls latest balance to fix "Zero Balance" issues.
 */
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

/**
 * Merged Status Update: Handles Approval and Rejection in one thunk.
 */
export const updateOrderStatus = createAsyncThunk(
  "vendor/updateOrderStatus",
  async (
    { orderId, status, trackingNumber }: { orderId: string; status: "APPROVED" | "REJECTED"; trackingNumber?: string }, 
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.patch(`/api/vendors/orders/${orderId}`, { status, trackingNumber });
      return { orderId, status, data: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update order");
    }
  }
);

/**
 * Processes a payout request and returns the updated balance.
 */
export const requestPayout = createAsyncThunk(
  "vendor/requestPayout",
  async (payload: PayoutPayload, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/vendors/payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to submit payout request");
      }

      return data.payout;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
// --- Slice ---
const vendorSlice = createSlice({
  name: "vendor",
  initialState,
  reducers: {


    updateCredits: (state, action: PayloadAction<number>) => {
      state.credits = action.payload;
    },

    setVendorProfile: (state, action: PayloadAction<any>) => {
      state.profile = action.payload;
      // Initialize credits from the profile object on load
      state.credits = action.payload?.boost?.credits || 0;
    },

    processAdminPayout: (state, action: PayloadAction<{ 
    requestId: string; 
    status: "APPROVED" | "REJECTED"; 
    remarks: string 
  }>) => {
    const { requestId, status, remarks } = action.payload;

    // Find the payout in our local state
    const payout = state.payouts.find((p) => p.id === requestId);
    
    if (payout) {
      payout.status = status;
      payout.adminRemarks = remarks;
      payout.processedAt = new Date().toISOString();
    }
    
    // Note: Because the Admin Table filters for 'PENDING', 
    // changing the status here automatically removes it from the UI.
  },



    setVendorData: (
  state,
  action: PayloadAction<{ profile: any; onboarding: Onboarding; balance: number; lastSyncedAt?: string }>
) => {
  // FIXED: Merge existing profile with new profile data
  state.profile = {
    ...state.profile,
    ...action.payload.profile
  };
  
  // Merge onboarding status as well
  state.onboarding = {
    ...state.onboarding,
    ...action.payload.onboarding
  };

  state.balance = Number(action.payload.balance || 0);
  
  if (action.payload.lastSyncedAt) {
    state.lastSyncedAt = action.payload.lastSyncedAt;
  }
},
    
    resetVendor: (state) => {
      return initialState;
    },
    // --- Admin Management Reducers ---
    setAllVendors: (state, action: PayloadAction<any[]>) => {
      state.vendors = action.payload;
    },
    updateVendorStatusInStore: (state, action: PayloadAction<{ vendorId: string; status: string }>) => {
      const vendor = state.vendors.find(v => v.id === action.payload.vendorId);
      if (vendor) {
        vendor.status = action.payload.status;
      }
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // 1. Admin Payouts
      .addCase(fetchAllPayouts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllPayouts.fulfilled, (state, action) => {
        state.loading = false;
        state.allPayouts = action.payload;
      })
      .addCase(fetchAllPayouts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(processAdminPayout.pending, (state) => {
        state.loading = true;
      })
      .addCase(processAdminPayout.fulfilled, (state, action) => {
        state.loading = false;
        // Remove the processed payout from the local list so the UI updates immediately
        if (state.payouts) {
          state.payouts = state.payouts.filter(
            (payout) => payout.id !== action.payload.requestId
          );
        }
      })


      .addCase(fetchAdminPayouts.fulfilled, (state, action) => {
        state.loading = false;
        state.payouts = action.payload; 
      })

      
      
      .addCase(processAdminPayout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
  
    

      // 2. Vendor Profile & Balance Sync
      .addCase(fetchVendorProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.profile;
        state.onboarding = action.payload.onboarding;
        state.balance = Number(action.payload.balance || 0);
        state.lastSyncedAt = action.payload.lastSyncedAt || null;
      })

      // 3. Vendor Orders
      .addCase(fetchVendorOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders || action.payload;
        if (action.payload.balance !== undefined) {
          state.balance = Number(action.payload.balance);
        }
      })

      // 4. Update Order Status
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.orders.findIndex(o => o.id === action.payload.orderId);
        if (index !== -1) {
          state.orders[index].status = action.payload.status;
        }
      })

      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      
      // 5. Request Payout
     .addCase(requestPayout.fulfilled, (state, action) => {
      state.loading = false;
      
      // action.payload is now the 'payout' object returned from our API
      // We subtract the amount from the local state balance immediately
      if (action.payload && action.payload.amount) {
        state.balance = state.balance - action.payload.amount
        state.balance = action.payload.newBalance; 
      }

      // Add the new payout request to the history log
      if (state.payouts) {
        state.payouts = [action.payload, ...state.payouts];
      }
    })
      
    .addCase(updateVendorSettings.pending, (state) => {
      state.loading = true;
    })
    .addCase(updateVendorSettings.fulfilled, (state, action) => {
      state.loading = false;
      // CRITICAL: Merge the new profile data with what's already there
      // action.payload should be the 'profile' object from your API response
      state.profile = {
        ...state.profile,
        ...(action.payload.profile || action.payload) 
      };
    })
    .addCase(updateVendorSettings.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })
          
      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state) => { state.loading = true; state.error = null; }
      )
      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action: any) => { 
          state.loading = false; 
          // We use a fallback string in case the payload is empty
          state.error = (action.payload as string) || "An unexpected error occurred"; 
        }
      );
  },
});

export const { 
  setVendorData, 
  setVendorProfile, 
  updateCredits,
  resetVendor, 
  setAllVendors, 
  updateVendorStatusInStore, 
  setSearchQuery, 
  setCurrentPage, 
  setStatusFilter 
} = vendorSlice.actions;

export default vendorSlice.reducer;