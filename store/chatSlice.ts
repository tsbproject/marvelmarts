// import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// interface VendorData {
//   id: string;
//   storeName: string;
//   _count?: { products: number };
//   // Add other fields based on your Prisma model
// }

// interface ChatState {
//   activeConversationId: string | null;
//   selectedVendor: VendorData | null;
//   loadingVendor: boolean;
// }

// const initialState: ChatState = {
//   activeConversationId: null,
//   selectedVendor: null,
//   loadingVendor: false,
// };

// // ASYNC THUNK: Fetches vendor details from the API we just discussed
// export const fetchVendorDetails = createAsyncThunk(
//   "chat/fetchVendorDetails",
//   async (vendorProfileId: string, { rejectWithValue }) => {
//     try {
//       const response = await fetch(`/api/admins/vendors/${vendorProfileId}`);
//       if (!response.ok) throw new Error("Failed to fetch vendor");
//       return await response.json();
//     } catch (err: any) {
//       return rejectWithValue(err.message);
//     }
//   }
// );

// export const chatSlice = createSlice({
//   name: "chat",
//   initialState,
//   reducers: {
//     setActiveConversation: (state, action: PayloadAction<string>) => {
//       state.activeConversationId = action.payload;
//     },
//     clearSelectedVendor: (state) => {
//       state.selectedVendor = null;
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchVendorDetails.pending, (state) => {
//         state.loadingVendor = true;
//       })
//       .addCase(fetchVendorDetails.fulfilled, (state, action) => {
//         state.loadingVendor = false;
//         state.selectedVendor = action.payload;
//       })
//       .addCase(fetchVendorDetails.rejected, (state) => {
//         state.loadingVendor = false;
//         state.selectedVendor = null;
//       });
//   },
// });

// export const { setActiveConversation, clearSelectedVendor } = chatSlice.actions;
// export default chatSlice.reducer;




import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// 1. Define types matching your Prisma schema
export enum ConversationType {
  CUSTOMER_VENDOR = "CUSTOMER_VENDOR",
  VENDOR_ADMIN = "VENDOR_ADMIN",
  CUSTOMER_ADMIN = "CUSTOMER_ADMIN",
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface Conversation {
  id: string;
  participantIds: string[];
  type: ConversationType;
  subject?: string;
  messages: Message[];
  updatedAt: string;
  createdAt: string;
}

interface VendorData {
  id: string;
  storeName: string;
  vendorProfileId?: string; // Standardized field
  isVerified?: boolean;
  _count?: { products: number };
}

interface ChatState {
  conversations: Conversation[]; // For the Admin/Vendor inbox list
  messages: Message[];           // For the currently open chat window
  activeConversationId: string | null;
  selectedVendor: VendorData | null;
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  conversations: [],
  messages: [],
  activeConversationId: null,
  selectedVendor: null,
  loading: false,
  error: null,
};

// ASYNC THUNK: Fetches vendor details
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
    // Set the list of all conversations (Used by Admin/Vendor Dashboard)
    setConversations: (state, action: PayloadAction<Conversation[]>) => {
      state.conversations = action.payload;
    },

    // Set active chat and load its messages
    setActiveConversation: (state, action: PayloadAction<string | null>) => {
      state.activeConversationId = action.payload;
      if (action.payload) {
        const selected = state.conversations.find((c) => c.id === action.payload);
        state.messages = selected ? selected.messages : [];
      } else {
        state.messages = [];
      }
    },

    // IMPORTANT: Adds a single message to the UI in real-time
    addMessage: (state, action: PayloadAction<Message>) => {
      // 1. Add to active message window if IDs match
      if (state.activeConversationId === action.payload.conversationId) {
        state.messages.push(action.payload);
      }

      // 2. Update the conversation in the inbox list (for Admin/Vendor visibility)
      const convIndex = state.conversations.findIndex(
        (c) => c.id === action.payload.conversationId
      );
      if (convIndex !== -1) {
        state.conversations[convIndex].messages.push(action.payload);
        state.conversations[convIndex].updatedAt = new Date().toISOString();
      }
    },

    clearSelectedVendor: (state) => {
      state.selectedVendor = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVendorDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVendorDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedVendor = action.payload;
      })
      .addCase(fetchVendorDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  setActiveConversation, 
  addMessage, 
  setConversations, 
  clearSelectedVendor 
} = chatSlice.actions;

export default chatSlice.reducer;