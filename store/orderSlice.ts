import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  items: OrderItem[];
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
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload;
    },
    updateOrderStatus: (state, action: PayloadAction<{ id: string; status: Order["status"] }>) => {
      const order = state.orders.find(o => o.id === action.payload.id);
      if (order) {
        order.status = action.payload.status;
      }
    },
    
  },
});

export const { setOrders, updateOrderStatus } = orderSlice.actions;
export default orderSlice.reducer;