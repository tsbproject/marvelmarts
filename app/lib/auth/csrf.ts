import { NextRequest } from "next/server";

import { forbidden } from "@/app/lib/auth/errors";
import { SecurityLogService } from "@/app/lib/services/logging/security-log.service";

export async function verifyOrigin(
  req: Request | NextRequest
) {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  const origin =
    req.headers.get("origin");

  const host =
    req.headers.get("host");

  if (!origin || !host) {
    await SecurityLogService.csrfBlocked({
      ipAddress:
        req.headers.get("x-forwarded-for") ??
        undefined,

      userAgent:
        req.headers.get("user-agent") ??
        undefined,

      requestPath:
        new URL(req.url).pathname,

      requestMethod:
        req.method,

      metadata: {
        reason: "Missing origin or host",
        origin,
        host,
      },
    });

    throw forbidden(
      "Invalid request origin."
    );
  }

  const expected = `https://${host}`;

  if (origin !== expected) {
    await SecurityLogService.csrfBlocked({
      ipAddress:
        req.headers.get("x-forwarded-for") ??
        undefined,

      userAgent:
        req.headers.get("user-agent") ??
        undefined,

      requestPath:
        new URL(req.url).pathname,

      requestMethod:
        req.method,

      metadata: {
        reason: "Origin mismatch",
        expected,
        received: origin,
      },
    });

    throw forbidden(
      "CSRF validation failed."
    );
  }
}