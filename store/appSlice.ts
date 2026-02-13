// store/slices/appSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AppState {
  viewMode: "CUSTOMER" | "VENDOR";
}

const initialState: AppState = {
  viewMode: "CUSTOMER", 
};

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setViewMode: (state, action: PayloadAction<"CUSTOMER" | "VENDOR">) => {
      state.viewMode = action.payload;
    },
    toggleViewMode: (state) => {
      state.viewMode = state.viewMode === "CUSTOMER" ? "VENDOR" : "CUSTOMER";
    },
  },
});

export const { setViewMode, toggleViewMode } = appSlice.actions;
export default appSlice.reducer;