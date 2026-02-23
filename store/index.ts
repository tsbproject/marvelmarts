


// import { configureStore, combineReducers, Action, ThunkAction, Middleware } from "@reduxjs/toolkit";
// import authReducer from "./authSlice";
// import cartReducer from "./cartSlice"; 
// import productReducer from "./productSlice"; 
// import wishlistReducer from "./wishlistSlice";
// import reviewsReducer from "./reviewsSlice"; 
// import adminReducer from "./adminSlice"; 
// import orderReducer from "./orderSlice"; 
// import trendingReducer from './trendingSlice';
// import notificationReducer from "./notificationSlice";
// import vendorReducer from "./vendorSlice"; 
// import appReducer from "./appSlice"; 

// /* --- 1. SUSPENSION GUARD MIDDLEWARE --- */
// /**
//  * Intercepts vendor actions and blocks them if the account is suspended.
//  * This uses a CustomEvent to bridge Redux to your NotificationContext.
//  */
// const suspensionGuard: Middleware = (storeAPI) => (next) => (action: any) => {
//   const state = storeAPI.getState();
//   const isSuspended = state.auth?.user?.isSuspended;

//   // These strings match the names provided in your createAsyncThunk definitions
//   const restrictedActions = [
//     'products/createProduct',
//     'products/updateProduct',
//     'products/deleteProduct',
//     'vendor/updateStoreSettings',
//     'vendor/requestPayout', // Adjusted to common naming convention
//   ];

//   if (isSuspended && restrictedActions.some(type => action.type.startsWith(type))) {
//     // We dispatch a custom browser event that NotificationContext will listen for
//     if (typeof window !== "undefined") {
//       const event = new CustomEvent('marvelmarts:suspension_error', {
//         detail: {
//           title: "Account Restricted",
//           message: "You cannot perform this action while your account is suspended."
//         }
//       });
//       window.dispatchEvent(event);
//     }
//     // Block the action from proceeding
//     return;
//   }

//   return next(action);
// };

// /* --- 2. REDUCER SETUP --- */
// const combinedReducer = combineReducers({
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
//   app: appReducer,
// });

// const rootReducer = (state: any, action: any) => {
//   if (action.type === "auth/logout") {
//     state = undefined;
//   }
//   return combinedReducer(state, action);
// };

// /* --- 3. STORE EXPORT --- */
// export const store = configureStore({
//   reducer: rootReducer,
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({
//       serializableCheck: {
//         ignoredActionPaths: ['payload.createdAt', 'payload.updatedAt', 'meta.arg'],
//         ignoredPaths: ['products.items', 'orders.orders'],
//       },
//     }).concat(suspensionGuard), // Added the guard here
// });

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;

// export type AppThunk<ReturnType = void> = ThunkAction<
//   ReturnType,
//   RootState,
//   unknown,
//   Action<string>
// >;




import { configureStore, combineReducers, Action, ThunkAction, Middleware } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import cartReducer from "./cartSlice"; 
import productReducer from "./productSlice"; 
import wishlistReducer from "./wishlistSlice";
import reviewsReducer from "./reviewsSlice"; 
import adminReducer from "./adminSlice"; 
import orderReducer from "./orderSlice"; 
import trendingReducer from './trendingSlice';
import notificationReducer from "./notificationSlice";
import vendorReducer from "./vendorSlice"; 
import appReducer from "./appSlice"; 

/* --- 1. SUSPENSION GUARD MIDDLEWARE --- */
/**
 * Intercepts vendor actions and blocks them if the account is suspended.
 */
const suspensionGuard: Middleware = (storeAPI) => (next) => (action: any) => {
  const state = storeAPI.getState() as RootState;
  const isSuspended = state.auth?.user?.isSuspended;

  // Actions that should be blocked if a vendor is suspended
  const restrictedActions = [
    'products/createProduct',
    'products/updateProduct',
    'products/deleteProduct',
    'vendor/updateStoreSettings',
    'vendor/requestPayout', // Matches the thunk in vendorSlice
    'vendor/updateOrderStatus', // Added to prevent status changes while suspended
  ];

  if (isSuspended && restrictedActions.some(type => action.type.startsWith(type))) {
    if (typeof window !== "undefined") {
      const event = new CustomEvent('marvelmarts:suspension_error', {
        detail: {
          title: "Account Restricted",
          message: "You cannot perform this action while your account is suspended."
        }
      });
      window.dispatchEvent(event);
    }
    return; // Block the action
  }

  return next(action);
};

/* --- 2. REDUCER SETUP --- */
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
  app: appReducer,
});

const rootReducer = (state: any, action: any) => {
  // Clear state on logout for security
  if (action.type === "auth/logout") {
    state = undefined;
  }
  return combinedReducer(state, action);
};

/* --- 3. STORE EXPORT --- */
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActionPaths: ['payload.createdAt', 'payload.updatedAt', 'meta.arg'],
        ignoredPaths: ['products.items', 'orders.orders'],
      },
    }).concat(suspensionGuard),
});

// TYPES EXPORTS
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;