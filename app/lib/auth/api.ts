import { NextResponse } from "next/server";

import { handleAuthError } from "./handlers";

/* -------------------------------------------------------------------------- */
/*                          API ERROR HANDLER                                 */
/* -------------------------------------------------------------------------- */

export function handleApiError(
  error: unknown
) {
  const authResponse =
    handleAuthError(error);

  if (authResponse) {
    return authResponse;
  }

  console.error(error);

  return NextResponse.json(
    {
      success: false,
      error: "Internal server error.",
    },
    {
      status: 500,
    }
  );
}