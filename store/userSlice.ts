import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserRole } from "@prisma/client";

// Define the exact same Permissions type used in your form and auth
export interface UserPermissions {
  manageAdmins: boolean;
  manageUsers: boolean;
  manageBlogs: boolean;
  manageProducts: boolean;
  manageOrders: boolean;
  manageMessages: boolean;
  manageSettings: boolean;
  manageCategories: boolean;
  manageReviews: boolean;
  manageSupport: boolean;
  manageActivity: boolean;
  manageTrending: boolean;
  manageSubscribers: boolean;
}

interface UserState {
  id: string;
  name: string;
  email: string;
  role: UserRole | null;
  permissions: UserPermissions | Record<string, boolean>;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  id: "",
  name: "",
  email: "",
  role: null,
  permissions: {},
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<Omit<UserState, "isAuthenticated">>) => {
      state.id = action.payload.id;
      state.name = action.payload.name;
      state.email = action.payload.email;
      state.role = action.payload.role;
      state.permissions = action.payload.permissions;
      state.isAuthenticated = true;
    },
    clearUser: (state) => {
      return initialState;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;