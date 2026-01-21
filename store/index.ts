import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import cartReducer from "./cartSlice"; 
import productReducer from "./productSlice"; 
export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    products: productReducer, // 2. Add this line to match 'state.products'
  },
});






export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;