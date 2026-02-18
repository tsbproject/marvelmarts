


// store/appSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AppState {
  viewMode: "CUSTOMER" | "VENDOR";
}

// Helper to get initial state safely (avoiding SSR errors)
const getInitialViewMode = (): "CUSTOMER" | "VENDOR" => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("marvel_view_mode");
    return (saved === "VENDOR" || saved === "CUSTOMER") ? saved : "CUSTOMER";
  }
  return "CUSTOMER";
};

const initialState: AppState = {
  viewMode: getInitialViewMode(), 
};

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setViewMode: (state, action: PayloadAction<"CUSTOMER" | "VENDOR">) => {
      state.viewMode = action.payload;
      // Save to localStorage so it survives the hard redirect
      if (typeof window !== "undefined") {
        localStorage.setItem("marvel_view_mode", action.payload);
      }
    },
    toggleViewMode: (state) => {
      const nextMode = state.viewMode === "CUSTOMER" ? "VENDOR" : "CUSTOMER";
      state.viewMode = nextMode;
      if (typeof window !== "undefined") {
        localStorage.setItem("marvel_view_mode", nextMode);
      }
    },
  },
});

export const { setViewMode, toggleViewMode } = appSlice.actions;
export default appSlice.reducer;