// import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// import { UserRole } from "@prisma/client";

// /**
//  * Explicit Permissions interface to match your Admin Form 
//  * and Sidebar logic.
//  */
// export interface UserPermissions {
//   manageAdmins: boolean;
//   manageUsers: boolean;
//   manageBlogs: boolean;
//   manageProducts: boolean;
//   manageOrders: boolean;
//   manageMessages: boolean;
//   manageSettings: boolean;
//   manageCategories: boolean;
//   manageReviews: boolean;
//   manageSupport: boolean;
//   manageActivity: boolean;
//   manageTrending: boolean;
//   manageSubscribers: boolean;
// }

// /**
//  * Updated User interface. 
//  * Note: email and name are required strings to satisfy Redux logic.
//  */
// interface User {
//   id: string;
//   name: string;
//   email: string;
//   role: UserRole | string;
//   permissions: UserPermissions | Record<string, boolean>;
// }

// interface AuthState {
//   user: User | null;
//   isAuthenticated: boolean;
//   // keeping token for compatibility with your existing structure
//   token: string | null; 
// }

// const initialState: AuthState = {
//   user: null,
//   token: null,
//   isAuthenticated: false,
// };

// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     /**
//      * Updated setUser to handle the payload safely.
//      * Use this in ClientLayout.tsx with the nullish coalescing operators (??) 
//      * we added earlier.
//      */
//     setUser(state, action: PayloadAction<User | null>) {
//       state.user = action.payload;
//       state.isAuthenticated = !!action.payload;
//     },
    
//     /**
//      * Renamed logout to clearUser for clarity in the sync process,
//      * but kept your logic of resetting state to null.
//      */
//     clearUser(state) {
//       state.user = null;
//       state.token = null;
//       state.isAuthenticated = false;
//     },

//     // Keeping your original logout name as an alias to avoid breaking other files
//     logout(state) {
//       state.user = null;
//       state.token = null;
//       state.isAuthenticated = false;
//     },
//   },
// });

// export const { setUser, logout, clearUser } = authSlice.actions;
// export default authSlice.reducer;




import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserRole } from "@prisma/client";

/**
 * Explicit Permissions interface to match your Admin Form 
 * and Sidebar logic.
 */
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

/**
 * Updated User interface. 
 * Note: email and name are required strings to satisfy Redux logic.
 */
interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole | string;
  permissions: UserPermissions | Record<string, boolean>;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  // keeping token for compatibility with your existing structure
  token: string | null; 
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /**
     * Updated setUser to handle the payload safely.
     * Use this in ClientLayout.tsx with nullish coalescing operators (??).
     */
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    
    /**
     * Renamed logout to clearUser for clarity in the sync process,
     * but kept your logic of resetting state to null.
     */
    clearUser(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },

    // Keeping your original logout name as an alias to avoid breaking other files
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, logout, clearUser } = authSlice.actions;
export default authSlice.reducer;