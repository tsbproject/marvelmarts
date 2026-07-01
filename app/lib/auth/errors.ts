

/* -------------------------------------------------------------------------- */
/*                              AUTH ERROR                                    */
/* -------------------------------------------------------------------------- */

export class AuthError extends Error {
  readonly status: number;

  constructor(
    message: string,
    status = 403
  ) {
    super(message);

    this.name = "AuthError";

    this.status = status;
  }
}

/* -------------------------------------------------------------------------- */
/*                           FACTORIES                                        */
/* -------------------------------------------------------------------------- */

export const unauthorized = () =>
  new AuthError(
    "Authentication required.",
    401
  );

export function forbidden(
  message = "Forbidden.",
  status = 403
) {
  return new AuthError(message, status);
}


export const notFound = (
  message = "Resource not found."
) =>
  new AuthError(message, 404);



  export const badRequest = (
  message = "Bad request."
) =>
  new AuthError(message, 400);

export const conflict = (
  message = "Conflict."
) =>
  new AuthError(message, 409);

export const gone = (
  message = "Resource is no longer available."
) =>
  new AuthError(message, 410);