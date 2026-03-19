import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { UserRole } from "@prisma/client";

// --- Types ---
export type Onboarding = {
  profileDone: boolean;
  storeDone: boolean;
  productDone: boolean;
  payoutsDone: boolean;
};

export type VerificationStatus =
  | "NOT_STARTED"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "PENDING_REVIEW";

interface PayoutPayload {
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface AdminVendor {
   id: string;
  userId: string;
  storeName: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  isSuspended: boolean;
  logoUrl?: string;
  coverUrl?: string;
  bio?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  instagram?: string;
  whatsapp?: string;
  twitter?: string;
  user: {
    email: string;
    name: string;
  };
  identityDoc?: string;
  businessDoc?: string;
  locationDoc?: string;
  verificationDoc?: string;
}

interface VendorState {
  credits: number;
  profile: any | null;
  user: any | null;
  roles: UserRole[];
  role: UserRole | null;
  status: VerificationStatus | null;
  verificationStatus: VerificationStatus | null;
  onboarding: Onboarding;
  balance: number;
  lastSyncedAt: string | null;
  orders: any[];
  allPayouts: any[];
  payouts: any[];
  selectedOrder: any | null;

  // Admin Management Fields
  vendors: AdminVendor[];
  searchQuery: string;
  statusFilter: string;
  currentPage: number;

  loading: boolean;
  error: string | null;
}

const initialState: VendorState = {
  credits: 0,
  profile: null,
  user: null,
  roles: [],
  role: null,
  status: null,
  verificationStatus: null,
  onboarding: {
    profileDone: false,
    storeDone: false,
    productDone: false,
    payoutsDone: false,
  },

  vendors: [],
  searchQuery: "",
  statusFilter: "ALL",
  currentPage: 1,

  balance: 0,
  lastSyncedAt: null,
  orders: [],
  allPayouts: [],
  payouts: [],
  selectedOrder: null,
  loading: false,
  error: null,
};

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
  async (
    {
      requestId,
      action,
      remarks,
    }: { requestId: string; action: "APPROVED" | "REJECTED"; remarks?: string },
    { rejectWithValue }
  ) => {
    try {
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
      const response = await axios.patch("/api/vendors/profile", settingsData);

      dispatch(
        setVendorData({
          profile: response.data.profile,
          onboarding: response.data.onboarding,
          balance: response.data.balance,
        })
      );

      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to update store settings";
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
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch payouts"
      );
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
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch orders"
      );
    }
  }
);

/**
 * Merged Status Update: Handles Approval and Rejection in one thunk.
 */
export const updateOrderStatus = createAsyncThunk(
  "vendor/updateOrderStatus",
  async (
    {
      orderId,
      status,
      trackingNumber,
    }: { orderId: string; status: "APPROVED" | "REJECTED"; trackingNumber?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.patch(`/api/vendors/orders/${orderId}`, {
        status,
        trackingNumber,
      });
      return { orderId, status, data: response.data };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update order"
      );
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

const vendorSlice = createSlice({
  name: "vendor",
  initialState,
  reducers: {
    updateCredits: (state, action: PayloadAction<number>) => {
      state.credits = action.payload;
    },

    setVendorProfile: (state, action: PayloadAction<any>) => {
      state.profile = action.payload;
      state.credits = action.payload?.boost?.credits || 0;
      if (action.payload?.roles) {
        state.roles = action.payload.roles;
      }
    },

    setVendorData: (
      state,
      action: PayloadAction<{
        profile: any;
        onboarding: Onboarding;
        balance: number;
        roles?: UserRole[];
        lastSyncedAt?: string;
      }>
    ) => {
      state.profile = {
        ...state.profile,
        ...action.payload.profile,
      };

      if (action.payload.roles) {
        state.roles = action.payload.roles;
      }

      state.onboarding = {
        ...state.onboarding,
        ...action.payload.onboarding,
      };
        
      if (typeof action.payload.balance === "number") {
            state.balance = Number(action.payload.balance);
          }
      // state.balance = Number(action.payload.balance || 0);

      if (action.payload.lastSyncedAt) {
        state.lastSyncedAt = action.payload.lastSyncedAt;
      }
    },

    resetVendor: () => {
      return initialState;
    },

    setVendorStatus: (state, action: PayloadAction<VerificationStatus>) => {
      state.status = action.payload;
    },

    setAllVendors: (state, action: PayloadAction<AdminVendor[]>) => {
      state.vendors = action.payload;
    },

    updateVendorStatusInStore: (
      state,
      action: PayloadAction<{
        vendorProfileId: string;
        status?: string;
        isSuspended?: boolean;
      }>
    ) => {
      const vendor = state.vendors.find((v) => v.id === action.payload.vendorProfileId);

      if (!vendor) return;

      if (
        action.payload.status === "PENDING" ||
        action.payload.status === "APPROVED" ||
        action.payload.status === "REJECTED"
      ) {
        vendor.status = action.payload.status;
      }

      if (action.payload.isSuspended !== undefined) {
        vendor.isSuspended = action.payload.isSuspended;
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
        if (state.payouts) {
          state.payouts = state.payouts.filter(
            (payout) => payout.id !== action.payload.requestId
          );
        }
      })
      .addCase(processAdminPayout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchAdminPayouts.fulfilled, (state, action) => {
        state.loading = false;
        state.payouts = action.payload;
      })

      .addCase(fetchVendorProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.profile;
        state.onboarding = action.payload.onboarding;
        state.balance = Number(action.payload.balance || 0);
        state.roles = action.payload.roles || [];
        state.status = action.payload.profile?.status || null;
        state.verificationStatus = action.payload.verificationStatus || "NOT_STARTED";
        state.lastSyncedAt = action.payload.lastSyncedAt || null;
      })

      .addCase(fetchVendorOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders || action.payload;
        if (action.payload.balance !== undefined) {
          state.balance = Number(action.payload.balance);
        }
      })

      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.orders.findIndex((o) => o.id === action.payload.orderId);
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

      .addCase(requestPayout.fulfilled, (state, action) => {
        state.loading = false;

        if (action.payload && action.payload.amount) {
          state.balance = action.payload.newBalance;
        }

        if (state.payouts) {
          state.payouts = [action.payload, ...state.payouts];
        }
      })

      .addCase(updateVendorSettings.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateVendorSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = {
          ...state.profile,
          ...(action.payload.profile || action.payload),
        };
      })
      .addCase(updateVendorSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addMatcher(
        (action) => action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action: any) => {
          state.loading = false;
          state.error =
            (action.payload as string) || "An unexpected error occurred";
        }
      );
  },
});

export const {
  setVendorData,
  setVendorProfile,
  updateCredits,
  resetVendor,
  setVendorStatus,
  setAllVendors,
  updateVendorStatusInStore,
  setSearchQuery,
  setCurrentPage,
  setStatusFilter,
  
} = vendorSlice.actions;

export default vendorSlice.reducer;