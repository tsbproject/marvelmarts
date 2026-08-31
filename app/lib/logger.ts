type Meta = Record<string, unknown>;

class Logger {
  info(message: string, meta?: Meta) {
    console.log(message, meta ?? "");
  }

  warn(message: string, meta?: Meta) {
    console.warn(message, meta ?? "");
  }

  error(message: string, error?: unknown, meta?: Meta) {
    console.error(message, {
      error,
      ...meta,
    });
  }
}

export const logger = new Logger();