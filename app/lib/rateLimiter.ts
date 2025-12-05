// /app/lib/rateLimiter.ts
type RateLimitRecord = {
  attempts: number;
  firstAttempt: number;
};

const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_ATTEMPTS = 5;

// email -> RateLimitRecord
const limiter = new Map<string, RateLimitRecord>();

export function isRateLimited(email: string): boolean {
  const now = Date.now();
  const record = limiter.get(email);

  if (!record) {
    limiter.set(email, { attempts: 1, firstAttempt: now });
    return false;
  }

  if (now - record.firstAttempt > RATE_LIMIT_WINDOW) {
    // Reset after time window
    limiter.set(email, { attempts: 1, firstAttempt: now });
    return false;
  }

  if (record.attempts >= MAX_ATTEMPTS) return true;

  limiter.set(email, { ...record, attempts: record.attempts + 1 });
  return false;
}

export function resetAttempts(email: string) {
  limiter.delete(email);
}
