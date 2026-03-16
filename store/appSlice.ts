


// // store/appSlice.ts
// import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// interface AppState {
//   viewMode: "CUSTOMER" | "VENDOR";
// }

// // Helper to get initial state safely (avoiding SSR errors)
// const getInitialViewMode = (): "CUSTOMER" | "VENDOR" => {
//   if (typeof window !== "undefined") {
//     const saved = localStorage.getItem("marvel_view_mode");
//     return (saved === "VENDOR" || saved === "CUSTOMER") ? saved : "CUSTOMER";
//   }
//   return "CUSTOMER";
// };

// const initialState: AppState = {
//   viewMode: getInitialViewMode(), 
// };

// export const appSlice = createSlice({
//   name: "app",
//   initialState,
//   reducers: {
//     setViewMode: (state, action: PayloadAction<"CUSTOMER" | "VENDOR">) => {
//       state.viewMode = action.payload;
//       // Save to localStorage so it survives the hard redirect
//       if (typeof window !== "undefined") {
//         localStorage.setItem("marvel_view_mode", action.payload);
//       }
//     },
//     toggleViewMode: (state) => {
//       const nextMode = state.viewMode === "CUSTOMER" ? "VENDOR" : "CUSTOMER";
//       state.viewMode = nextMode;
//       if (typeof window !== "undefined") {
//         localStorage.setItem("marvel_view_mode", nextMode);
//       }
//     },
//   },
// });

// export const { setViewMode, toggleViewMode } = appSlice.actions;
// export default appSlice.reducer;




// store/appSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Helper to determine initial view mode based on role (if available)
const getInitialViewMode = (sessionRole?: string): "CUSTOMER" | "VENDOR" | "ADMIN" => {
  // If role is explicitly ADMIN → force ADMIN mode
  if (sessionRole === "ADMIN" || sessionRole === "SUPER_ADMIN") {
    return "ADMIN";
  }

  // Check saved preference first
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("marvel_view_mode");
    if (saved === "VENDOR" || saved === "CUSTOMER" || saved === "ADMIN") {
      return saved as "CUSTOMER" | "VENDOR" | "ADMIN";
    }
  }

  // Default to CUSTOMER for everyone else
  return "CUSTOMER";
};

interface AppState {
  viewMode: "CUSTOMER" | "VENDOR" | "ADMIN";
}

const initialState: AppState = {
  viewMode: getInitialViewMode(), // will be updated on login
};

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setViewMode: (state, action: PayloadAction<"CUSTOMER" | "VENDOR" | "ADMIN">) => {
      state.viewMode = action.payload;
      if (typeof window !== "undefined") {
        localStorage.setItem("marvel_view_mode", action.payload);
      }
    },
    toggleViewMode: (state) => {
      // Optional: cycle through allowed modes based on role
      const current = state.viewMode;
      let next: "CUSTOMER" | "VENDOR" | "ADMIN";

      if (current === "CUSTOMER") next = "VENDOR";
      else if (current === "VENDOR") next = "ADMIN";
      else next = "CUSTOMER";

      state.viewMode = next;
      if (typeof window !== "undefined") {
        localStorage.setItem("marvel_view_mode", next);
      }
    },
  },
});

export const { setViewMode, toggleViewMode } = appSlice.actions;
export default appSlice.reducer;