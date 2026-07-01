import { NextResponse } from "next/server";

import { AuthError } from "./errors";

/* -------------------------------------------------------------------------- */
/*                    AUTHENTICATION ERROR HANDLER                            */
/* -------------------------------------------------------------------------- */

export function handleAuthError(
  error: unknown
) {
  if (!(error instanceof AuthError)) {
    return null;
  }

  return NextResponse.json(
    {
      success: false,
      error: error.message,
    },
    {
      status: error.status,
    }
  );
}