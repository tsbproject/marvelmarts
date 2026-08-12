// store/appSlice.ts

import {
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";

/* -------------------------------------------------------------------------- */
/*                                TYPES                                       */
/* -------------------------------------------------------------------------- */

export type ViewMode =
  | "CUSTOMER"
  | "VENDOR"
  | "ADMIN";

interface AppState {
  viewMode: ViewMode;
}

/* -------------------------------------------------------------------------- */
/*                         SAVED VIEW MODE                                     */
/* -------------------------------------------------------------------------- */

const getSavedViewMode = (): ViewMode => {
  if (typeof window === "undefined") {
    return "CUSTOMER";
  }

  const saved =
    localStorage.getItem(
      "marvel_view_mode"
    );

  if (
    saved === "CUSTOMER" ||
    saved === "VENDOR" ||
    saved === "ADMIN"
  ) {
    return saved;
  }

  return "CUSTOMER";
};

/* -------------------------------------------------------------------------- */
/*                              INITIAL STATE                                  */
/* -------------------------------------------------------------------------- */

const initialState: AppState = {
  viewMode: getSavedViewMode(),
};

/* -------------------------------------------------------------------------- */
/*                                  SLICE                                      */
/* -------------------------------------------------------------------------- */

export const appSlice =
  createSlice({
    name: "app",

    initialState,

    reducers: {
      setViewMode: (
        state,
        action: PayloadAction<ViewMode>
      ) => {
        state.viewMode =
          action.payload;

        if (
          typeof window !==
          "undefined"
        ) {
          localStorage.setItem(
            "marvel_view_mode",
            action.payload
          );
        }
      },

      resetViewMode: (state) => {
        state.viewMode =
          "CUSTOMER";

        if (
          typeof window !==
          "undefined"
        ) {
          localStorage.removeItem(
            "marvel_view_mode"
          );
        }
      },
    },
  });

export const {
  setViewMode,
  resetViewMode,
} = appSlice.actions;

export default appSlice.reducer;