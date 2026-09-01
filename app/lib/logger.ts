import {
  redactError,
  redactSensitiveData,
} from "@/app/lib/logging/redaction";

type Meta = Record<string, unknown>;

class Logger {
  info(message: string, meta?: Meta) {
    console.log(
      message,
      meta
        ? redactSensitiveData(meta)
        : ""
    );
  }

  warn(message: string, meta?: Meta) {
    console.warn(
      message,
      meta
        ? redactSensitiveData(meta)
        : ""
    );
  }

  error(
    message: string,
    error?: unknown,
    meta?: Meta
  ) {
    console.error(message, {
      error: redactError(error),
      ...(meta
        ? redactSensitiveData(meta)
        : {}),
    });
  }
}

export const logger = new Logger();
