// import { configureStore } from "@reduxjs/toolkit";
// import authReducer from "./authSlice";
// import cartReducer from "./cartSlice"; 
// import productReducer from "./productSlice"; 
// import wishlistReducer from "./wishlistSlice";


// export const store = configureStore({

//   reducer: {
//     auth: authReducer,
//     cart: cartReducer,
//     products: productReducer, 
//     wishlist: wishlistReducer, 
//   },
// });






// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;



import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import cartReducer from "./cartSlice"; 
import productReducer from "./productSlice"; 
import wishlistReducer from "./wishlistSlice";

/**
 * Global Store Configuration for MarvelMarts
 * We have registered the updated productReducer which now handles
 * the dynamic grouping (Featured, Flash Sales, New Arrivals).
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    products: productReducer, 
    wishlist: wishlistReducer, 
  },
  // Adding middleware configuration to handle non-serializable data (like Dates from Prisma)
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these paths if you receive warnings about createdAt/updatedAt dates
        ignoredActionPaths: ['payload.createdAt', 'payload.updatedAt', 'meta.arg'],
        ignoredPaths: ['products.items'],
      },
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;