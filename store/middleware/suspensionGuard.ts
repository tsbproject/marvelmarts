import { Middleware } from '@reduxjs/toolkit';

export const suspensionGuard: Middleware = (store) => (next) => (action: any) => {
  const state = store.getState();
  
  // Get suspension status from your Redux auth state
  const isSuspended = state.auth.user?.isSuspended;

  const restrictedActions = [
    'products/createProduct',
    'products/updateProduct',
    'products/deleteProduct',
    'payouts/requestWithdrawal',
  ];

  if (isSuspended && restrictedActions.some(type => action.type.startsWith(type))) {
    // Instead of a direct function call, we dispatch a global error action
    // that your UI components can listen for.
    store.dispatch({
      type: 'ui/triggerSuspensionError',
      payload: {
        title: "Action Restricted",
        message: "You cannot perform this action while your account is suspended."
      }
    });
    
    return; 
  }

  return next(action);
};