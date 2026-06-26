/* -------------------------------------------------------------------------- */
/*                         AUTHENTICATION CONSTANTS                           */
/* -------------------------------------------------------------------------- */

export const SESSION_MAX_AGE =
  30 * 24 * 60 * 60; // 30 days

export const JWT_MAX_AGE =
  SESSION_MAX_AGE;

export const AUTH_REFRESH_INTERVAL =
  1000 * 60 * 60; // 1 hour