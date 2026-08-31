type RateLimitRecord = {
  attempts: number;
  blockedUntil?: number;
};

const MAX_ATTEMPTS = 5;
const BLOCK_DURATION = 60 * 60 * 1000; // 1 hour

const limiter = new Map<string, RateLimitRecord>();

export function isBlocked(key: string): boolean {
  const record = limiter.get(key);

  if (!record?.blockedUntil) {
    return false;
  }

  if (Date.now() >= record.blockedUntil) {
    limiter.delete(key);
    return false;
  }

  return true;
}

export function recordFailure(
  key: string,
  maxAttempts = MAX_ATTEMPTS
) {
  const record =
    limiter.get(key) ?? {
      attempts: 0,
    };

  record.attempts++;

  if (record.attempts >= maxAttempts) {
    record.blockedUntil =
      Date.now() + BLOCK_DURATION;
  }

  limiter.set(key, record);
}

export function resetAttempts(
  key: string
) {
  limiter.delete(key);
}

export function getRemainingAttempts(
  key: string
) {
  const record = limiter.get(key);

  if (!record) {
    return MAX_ATTEMPTS;
  }

  return Math.max(
    0,
    MAX_ATTEMPTS - record.attempts
  );
}