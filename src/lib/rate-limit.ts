/**
 * Rate limit implementation using in-memory Map.
 * For production, replace with Redis:
 * @example
 * // Redis implementation:
 * const redis = new Redis(process.env.REDIS_URL!);
 * const count = await redis.incr(`ratelimit:${key}`);
 * if (count === 1) await redis.expire(`ratelimit:${key}`, windowSec);
 * return { success: count <= limit, remaining: Math.max(0, limit - count) };
 */
const store = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  limit: number,
  windowSec: number
): { success: boolean; remaining: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowSec * 1000 });
    return { success: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0 };
  }

  entry.count++;
  return { success: true, remaining: limit - entry.count };
}
