import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CustomerNotification {
  id: string;
  orderId: string;
  type: "refund_approved" | "refund_rejected";
  message: string;
  isRead: boolean;
  createdAt: string;
}

const initialState = {
  notifications: [] as CustomerNotification[],
};

const customerNotificationSlice = createSlice({
  name: "customerNotifications",
  initialState,
  reducers: {
    addCustomerNotification: (state, action: PayloadAction<Omit<CustomerNotification, "id" | "isRead" | "createdAt">>) => {
      state.notifications.unshift({
        ...action.payload,
        id: Math.random().toString(36).substr(2, 9),
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const note = state.notifications.find(n => n.id === action.payload);
      if (note) note.isRead = true;
    },
  },
});

export const { addCustomerNotification, markAsRead } = customerNotificationSlice.actions;
export default customerNotificationSlice.reducer;