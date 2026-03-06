/**
 * In-memory rate limiter (sliding window, fixed 1-minute).
 * Fail-open: on error (e.g. memory/parsing), allows the request.
 * Environment variable RATE_LIMIT_ENABLED (default true) can disable.
 */

type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();
const WINDOW_MS = 60_000; // 1 minute
const CLEANUP_INTERVAL_MS = 120_000; // every 2 min remove old entries

let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function cleanup() {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) store.delete(key);
  }
}

function ensureCleanup() {
  if (!cleanupTimer) {
    cleanupTimer = setInterval(cleanup, CLEANUP_INTERVAL_MS);
    if (cleanupTimer.unref) cleanupTimer.unref();
  }
}

function isEnabled(): boolean {
  const v = process.env.RATE_LIMIT_ENABLED;
  if (v === undefined || v === "") return true;
  return v === "1" || v.toLowerCase() === "true";
}

/**
 * Check if request is allowed. Returns true if allowed, false if rate limited.
 * Fail-open: on any error returns true (allow request).
 */
export function checkRateLimit(key: string, limit: number): boolean {
  try {
    if (!isEnabled()) return true;

    ensureCleanup();
    const now = Date.now();
    const entry = store.get(key);

    if (!entry) {
      store.set(key, { count: 1, resetAt: now + WINDOW_MS });
      return true;
    }

    if (entry.resetAt <= now) {
      store.set(key, { count: 1, resetAt: now + WINDOW_MS });
      return true;
    }

    if (entry.count >= limit) return false;
    entry.count++;
    return true;
  } catch {
    return true; // fail open
  }
}
