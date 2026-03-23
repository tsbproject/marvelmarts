




import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface OrderItem {
  id: string;
  productId: string;
  name: string; 
  image?: string; 
  quantity: number;
  price: number;
}

export interface Order {
  orderNumber: string; 
  id: string;
  userId: string;
  customerName: string;
  customerEmail?: string; 
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
  refundStatus?: "none" | "requested" | "approved" | "rejected"; // Roadmap: Order refund flow
  items: OrderItem[];
  shippingAddress?: string; // Roadmap: Shipping selection
  trackingNumber?: string;
  createdAt: string;
}

interface OrderState {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  loading: false,
  error: null,
};

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    // Set all orders (used for dashboard hydration)
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload;
      state.loading = false;
      state.error = null;
    },

    // Add a single new order (used after successful checkout)
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.unshift(action.payload); // Add to the top of the list
    },

    // Update status (used by Admin or automated tracking)
    updateOrderStatus: (state, action: PayloadAction<{ id: string; status: Order["status"] }>) => {
      const order = state.orders.find(o => o.id === action.payload.id);
      if (order) {
        order.status = action.payload.status;
      }
    },

    // Roadmap Item (a): Order refund flow
    requestRefund: (state, action: PayloadAction<{ id: string }>) => {
      const order = state.orders.find(o => o.id === action.payload.id);
      if (order) {
        order.refundStatus = "requested";
      }
    },

    // Roadmap Item (a): Update refund status
    updateRefundStatus: (state, action: PayloadAction<{ id: string; status: Order["refundStatus"] }>) => {
      const order = state.orders.find(o => o.id === action.payload.id);
      if (order) {
        order.refundStatus = action.payload.status;
        if (action.payload.status === "approved") {
          order.status = "refunded";
        }
      }
    },

    // Manual cleanup action
    clearOrders: (state) => {
      return initialState;
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    
    
    updateOrderInState: (state, action) => {
    const updatedOrder = action.payload;
    const index = state.orders.findIndex(
        (o) =>
          o.orderNumber === updatedOrder.orderNumber ||
          o.id === updatedOrder.id // ✅ fallback safety
      );
        if (index !== -1) {
      state.orders[index] = updatedOrder;
    }
  },
  },


});

export const { 
  setOrders, 
  addOrder, 
  updateOrderStatus, 
  updateOrderInState,
  requestRefund, 
  updateRefundStatus, 
  clearOrders,
  setLoading, 
  setError 
} = orderSlice.actions;

export default orderSlice.reducer;