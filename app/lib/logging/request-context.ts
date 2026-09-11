import { randomUUID } from "crypto";
import { AsyncLocalStorage } from "node:async_hooks";
import { headers } from "next/headers";

interface RequestContext {
  requestId: string;
  ipAddress?: string;
  userAgent?: string;
  requestPath?: string;
  requestMethod?: string;
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

export function getRequestPath(
  request: Request
): string {
  return new URL(request.url).pathname;
}

export function getRequestMethod(
  request: Request
): string {
  return request.method;
}

/**
 * Runs the request handler inside the current
 * request context.
 */
export function runWithRequestContext<T>(
  requestId: string,
  request: Request,
  callback: () => Promise<T>
): Promise<T> {
  return requestContextStorage.run(
    {
      requestId,
      ipAddress: getRequestIp(request),
      userAgent: getRequestUserAgent(request),
      requestPath: getRequestPath(request),
      requestMethod: getRequestMethod(request),
    },
    callback
  );
}



/**
 * Runs a Server Action inside the current
 * request context.
 */
export async function runWithServerActionContext<T>(
  callback: () => Promise<T>
): Promise<T> {
  const requestHeaders = await headers();

  const requestId =
    requestHeaders.get("x-request-id") ??
    randomUUID();

  const ipAddress =
    requestHeaders.get("x-forwarded-for") ??
    requestHeaders.get("x-real-ip") ??
    undefined;

  const userAgent =
    requestHeaders.get("user-agent") ??
    undefined;

  return requestContextStorage.run(
    {
      requestId,
      ipAddress,
      userAgent,
      requestPath: undefined,
      requestMethod: "POST",
    },
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

/**
 * Returns the IP address associated with the
 * currently executing HTTP request.
 */
export function getCurrentRequestIp():
  | string
  | undefined {
  return requestContextStorage.getStore()
    ?.ipAddress;
}

/**
 * Returns the user agent associated with the
 * currently executing HTTP request.
 */
export function getCurrentRequestUserAgent():
  | string
  | undefined {
  return requestContextStorage.getStore()
    ?.userAgent;
}

/**
 * Returns the pathname associated with the
 * currently executing HTTP request.
 */
export function getCurrentRequestPath():
  | string
  | undefined {
  return requestContextStorage.getStore()
    ?.requestPath;
}

/**
 * Returns the HTTP method associated with the
 * currently executing HTTP request.
 */
export function getCurrentRequestMethod():
  | string
  | undefined {
  return requestContextStorage.getStore()
    ?.requestMethod;
}