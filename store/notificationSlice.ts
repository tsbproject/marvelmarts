import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AdminNotification {
  id: string;
  // ALIGNMENT: Added "message" to the type union
  type: "refund" | "cancel" | "dispute" | "vendor" | "system" | "message"; 
  orderId?: string;
  customerName?: string;
  storeName?: string;
  title?: string;
  message?: string;
  link?: string;
  amount?: number;
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
  
  addNotification: (
      state, 
      action: PayloadAction<Omit<AdminNotification, "id" | "isRead" | "createdAt">>

     
    ) => {
      // TACTICAL CHECK: Don't block messages as duplicates if they come from the same person
      const isDuplicate = state.notifications.some((n) => {
        if (action.payload.type === "message") return false; // Always allow new messages
        
        if (action.payload.orderId && n.orderId === action.payload.orderId) {
          return n.type === action.payload.type;
        }
        return n.title === action.payload.title && n.message === action.payload.message;
      });

      if (!isDuplicate) {
        const newNotification: AdminNotification = {
          ...action.payload,
          id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`, 
          isRead: false,
          createdAt: new Date().toISOString(),
        };
        // Add to top of the list
        state.notifications = [newNotification, ...state.notifications];
      }
    },

    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find((n) => n.id === action.payload);
      if (notification) {
        notification.isRead = true;
      }
    },

    markAllAsRead: (state) => {
      state.notifications.forEach((n) => {
        n.isRead = true;
      });
    },

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