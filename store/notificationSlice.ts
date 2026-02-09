import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AdminNotification {
  id: string; // Unique ID for the notification entry
  orderId: string;
  type: "refund" | "cancel";
  customerName: string;
  amount: number;
  createdAt: string;
  isRead: boolean;
}

interface NotificationState {
  notifications: AdminNotification[];
}

const initialState: NotificationState = {
  notifications: [],
};

const notificationSlice = createSlice({
  name: "adminNotifications",
  initialState,
  reducers: {
    // Add a new notification to the top of the list
    addNotification: (
      state, 
      action: PayloadAction<Omit<AdminNotification, "id" | "isRead" | "createdAt">>
    ) => {
      // Check for duplicates to prevent the same notification appearing twice
      const isDuplicate = state.notifications.some(
        (n) => n.orderId === action.payload.orderId && n.type === action.payload.type
      );

      if (!isDuplicate) {
        const newNotification: AdminNotification = {
          ...action.payload,
          id: `notif-${Math.random().toString(36).substring(2, 9)}`, // More robust ID
          isRead: false,
          createdAt: new Date().toISOString(),
        };
        // Unshift adds to the beginning of the array (top of the bell)
        state.notifications = [newNotification, ...state.notifications];
      }
    },
    // Mark a specific notification as read
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find((n) => n.id === action.payload);
      if (notification) {
        notification.isRead = true;
      }
    },
    // Mark all as read (useful when opening the bell dropdown)
    markAllAsRead: (state) => {
      state.notifications.forEach((n) => {
        n.isRead = true;
      });
    },
    // Clear old notifications
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const { 
  addNotification, 
  markAsRead, 
  markAllAsRead, 
  clearNotifications 
} = notificationSlice.actions;

export default notificationSlice.reducer;