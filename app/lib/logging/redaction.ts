
import { Prisma } from "@prisma/client";

const SENSITIVE_KEYS = new Set([
  "password",
  "passwordHash",
  "newPassword",
  "confirmPassword",
  "token",
  "accessToken",
  "guestAccessToken",
  "autoLoginToken",
  "resetToken",
  "authorization",
  "authorizationCode",
  "authorization_code",
  "secret",
  "apiKey",
  "api_key",
  "privateKey",
  "private_key",
  "nextAuthSecret",
  "paystackSecret",
  "cloudinaryApiSecret",
]);

const REDACTED = "[REDACTED]";

function isObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

export function redactSensitiveData<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) =>
      redactSensitiveData(item)
    ) as T;
  }

  if (isObject(value)) {
    const result: Record<string, unknown> = {};

    for (const [key, child] of Object.entries(value)) {
      if (SENSITIVE_KEYS.has(key)) {
        result[key] = REDACTED;
      } else {
        result[key] = redactSensitiveData(child);
      }
    }

    return result as T;
  }

  return value;
}

export function redactError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return redactSensitiveData(error);
}

export function redactJson(
  value: Prisma.InputJsonValue | undefined
): Prisma.InputJsonValue | undefined {
  if (value === undefined) {
    return undefined;
  }

  return redactSensitiveData(value);
}
