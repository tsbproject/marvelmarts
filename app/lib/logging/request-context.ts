import { randomUUID } from "crypto";
import { AsyncLocalStorage } from "node:async_hooks";

interface RequestContext {
  requestId: string;
}

const requestContextStorage =
  new AsyncLocalStorage<RequestContext>();

export function getRequestId(
  request: Request
): string {
  return (
    request.headers.get("x-request-id") ??
    randomUUID()
  );
}

export function getRequestIp(
  request: Request
): string | undefined {
  return (
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    undefined
  );
}

export function getRequestUserAgent(
  request: Request
): string | undefined {
  return (
    request.headers.get("user-agent") ??
    undefined
  );
}

/**
 * Runs the request handler inside the current
 * request context.
 */
export function runWithRequestContext<T>(
  requestId: string,
  callback: () => Promise<T>
): Promise<T> {
  return requestContextStorage.run(
    { requestId },
    callback
  );
}

/**
 * Returns the request ID associated with the
 * currently executing HTTP request.
 */
export function getCurrentRequestId():
  | string
  | undefined {
  return requestContextStorage.getStore()
    ?.requestId;
}