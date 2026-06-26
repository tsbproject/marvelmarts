import { NextResponse } from "next/server";

export function unauthorized(
  message = "Authentication required."
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    {
      status: 401,
    }
  );
}

export function forbidden(
  message = "You do not have permission to perform this action."
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    {
      status: 403,
    }
  );
}

export function badRequest(
  message = "Bad request."
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    {
      status: 400,
    }
  );
}

export function notFound(
  message = "Resource not found."
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    {
      status: 404,
    }
  );
}

export function serverError(
  message = "Internal server error."
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    {
      status: 500,
    }
  );
}