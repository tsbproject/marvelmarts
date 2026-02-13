
// import { configureStore, combineReducers, Action, ThunkAction } from "@reduxjs/toolkit";
// import authReducer from "./authSlice";
// import cartReducer from "./cartSlice"; 
// import productReducer from "./productSlice"; 
// import wishlistReducer from "./wishlistSlice";
// import reviewsReducer from "./reviewsSlice"; 
// import adminReducer from "./adminSlice"; 
// import orderReducer from "./orderSlice"; 
// import trendingReducer from './trendingSlice';
// import notificationReducer from "./notificationSlice";
// import vendorReducer from ".//vendorSlice";


// // 1. Combine all reducers into a single appReducer
// const appReducer = combineReducers({
//   auth: authReducer,
//   cart: cartReducer,
//   products: productReducer, 
//   wishlist: wishlistReducer, 
//   reviews: reviewsReducer, 
//   admin: adminReducer, 
//   orders: orderReducer, 
//   trending: trendingReducer,
//   adminNotifications: notificationReducer,
//   vendor: vendorReducer,
// });

// // 2. Create a Root Reducer to handle global state reset
// const rootReducer = (state: any, action: any) => {
//   // Dispatched when a user logs out to wipe all sensitive data
//   if (action.type === "auth/logout") {
//     // Reset the entire state to undefined. 
//     // This forces Redux to re-initialize every slice with its initialState.
//     state = undefined;
//   }
//   return appReducer(state, action);
// };

// /**
//  * Global Store Configuration for MarvelMarts
//  * State is strictly tied to the user session via the rootReducer reset logic.
//  */
// export const store = configureStore({
//   reducer: rootReducer,
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({
//       serializableCheck: {
//         // Ignore Date objects from Prisma to prevent console warnings
//         ignoredActionPaths: ['payload.createdAt', 'payload.updatedAt', 'meta.arg'],
//         ignoredPaths: ['products.items', 'orders.orders'],
//       },
//     }),
// });

// // Infer the `RootState` and `AppDispatch` types from the store itself
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;

// // Helpful type for Thunk actions
// export type AppThunk<ReturnType = void> = ThunkAction<
//   ReturnType,
//   RootState,
//   unknown,
//   Action<string>
// >;





import { configureStore, combineReducers, Action, ThunkAction } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import cartReducer from "./cartSlice"; 
import productReducer from "./productSlice"; 
import wishlistReducer from "./wishlistSlice";
import reviewsReducer from "./reviewsSlice"; 
import adminReducer from "./adminSlice"; 
import orderReducer from "./orderSlice"; 
import trendingReducer from './trendingSlice';
import notificationReducer from "./notificationSlice";
import vendorReducer from ".//vendorSlice";
import appReducer from "./appSlice"; // Added appSlice for viewMode management


// 1. Combine all reducers into a single appReducer
const combinedReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  products: productReducer, 
  wishlist: wishlistReducer, 
  reviews: reviewsReducer, 
  admin: adminReducer, 
  orders: orderReducer, 
  trending: trendingReducer,
  adminNotifications: notificationReducer,
  vendor: vendorReducer,
  app: appReducer, // Registered appSlice here
});

// 2. Create a Root Reducer to handle global state reset
const rootReducer = (state: any, action: any) => {
  // Dispatched when a user logs out to wipe all sensitive data
  if (action.type === "auth/logout") {
    // Reset the entire state to undefined. 
    // This forces Redux to re-initialize every slice with its initialState.
    // This ensures viewMode resets to "CUSTOMER" automatically on logout.
    state = undefined;
  }
  return combinedReducer(state, action);
};

/**
 * Global Store Configuration for MarvelMarts
 * State is strictly tied to the user session via the rootReducer reset logic.
 */
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore Date objects from Prisma to prevent console warnings
        ignoredActionPaths: ['payload.createdAt', 'payload.updatedAt', 'meta.arg'],
        ignoredPaths: ['products.items', 'orders.orders'],
      },
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Helpful type for Thunk actions
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;