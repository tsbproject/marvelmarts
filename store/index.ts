import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import cartReducer from "./cartSlice"; 

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer, // Registering the cart reducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;