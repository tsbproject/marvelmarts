import { ApiLogService } from "@/app/lib/services/logging/api-log.service";

import {
  getRequestId,
  getRequestIp,
  getRequestUserAgent,
  runWithRequestContext,
} from "./request-context";

type ApiHandler<TContext, TRequest extends Request = Request> = (
  request: TRequest,
  context: TContext
) => Promise<Response>;

export function withApiLogging<
  TContext,
  TRequest extends Request = Request
>(
  handler: ApiHandler<TContext, TRequest>
): ApiHandler<TContext, TRequest> {
  return async (
    request: TRequest,
    context: TContext
  ) => {
    const requestId =
      getRequestId(request);

    const startedAt = Date.now();

    return runWithRequestContext(
      requestId,
      request,
      async () => {
        try {
          const response =
            await handler(
              request,
              context
            );

          const durationMs =
            Date.now() - startedAt;

          response.headers.set(
            "x-request-id",
            requestId
          );

          await ApiLogService.log({
            requestId,
            method: request.method,
            path: new URL(
              request.url
            ).pathname,
            statusCode:
              response.status,
            durationMs,
            ipAddress:
              getRequestIp(request),
            userAgent:
              getRequestUserAgent(request),
          });

          return response;
        } catch (error) {
          const durationMs =
            Date.now() - startedAt;

          await ApiLogService.log({
            requestId,
            method: request.method,
            path: new URL(
              request.url
            ).pathname,
            statusCode: 500,
            durationMs,
            ipAddress:
              getRequestIp(request),
            userAgent:
              getRequestUserAgent(request),
          });

          throw error;
        }
      }
    );
  };
}