export function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function stripDangerousChars(value: string) {
  return value
    .normalize("NFKC")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/[<>`]/g, "")
    .replace(/javascript:/gi, "")
    .replace(/data:/gi, "")
    .replace(/vbscript:/gi, "");
}

export function sanitizeText(
  value: unknown,
  maxLength: number
) {
  return normalizeWhitespace(
    stripDangerousChars(
      String(value ?? "")
    )
  ).slice(0, maxLength);
}

export function sanitizeEmail(
  value: unknown
) {
  return stripDangerousChars(
    String(value ?? "")
  )
    .replace(/\s+/g, "")
    .toLowerCase()
    .slice(0, 120);
}

export function sanitizePhone(
  value: unknown
) {
  return String(value ?? "")
    .replace(/[^\d+\-()\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 20);
}

export function sanitizeName(
  value: unknown
) {
  return sanitizeText(
    String(value ?? "").replace(
      /[^A-Za-zÀ-ÿ'\-\s]/g,
      ""
    ),
    50
  );
}

export function sanitizeCityOrState(
  value: unknown,
  maxLength = 60
) {
  return sanitizeText(
    String(value ?? "").replace(
      /[^A-Za-zÀ-ÿ'.\-\s]/g,
      ""
    ),
    maxLength
  );
}

export function sanitizeAddress(
  value: unknown,
  maxLength = 150
) {
  return sanitizeText(
    String(value ?? "").replace(
      /[^A-Za-z0-9À-ÿ#.,/\-()\s]/g,
      ""
    ),
    maxLength
  );
}