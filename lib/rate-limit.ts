// NOTE: rate limiter with Upstash Redis backend and in-memory fallback.

// NOTE: in production, uses `@upstash/ratelimit` with a sliding-window algorithm backed by Upstash Redis — works correctly across serverless instances.

// NOTE: in development (or when UPSTASH_REDIS_REST_URL is not set), falls back to a simple in-memory sliding-window limiter that resets on server restart.

// Usage:
// ```ts
// const limiter = createRateLimiter({ limit: 10, windowMs: 60_000 });
// const { success } = await limiter.check(ip);
// if (!success) return new Response("Too many requests", { status: 429 });
// ```

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

interface RateLimiterOptions {
  // NOTE: maximum number of requests allowed in the window
  limit: number;
  // NOTE: window duration in milliseconds
  windowMs: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
}

function createInMemoryLimiter({ limit, windowMs }: RateLimiterOptions) {
  const hits = new Map<string, number[]>();

  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of hits) {
      const valid = timestamps.filter((t) => now - t < windowMs);
      if (valid.length === 0) {
        hits.delete(key);
      } else {
        hits.set(key, valid);
      }
    }
  }, windowMs);

  if (typeof cleanup === "object" && "unref" in cleanup) {
    cleanup.unref();
  }

  return {
    async check(key: string): Promise<RateLimitResult> {
      const now = Date.now();
      const timestamps = (hits.get(key) ?? []).filter((t) => now - t < windowMs);

      if (timestamps.length >= limit) {
        hits.set(key, timestamps);
        return { success: false, remaining: 0 };
      }

      timestamps.push(now);
      hits.set(key, timestamps);
      return { success: true, remaining: limit - timestamps.length };
    },
  };
}

function createUpstashLimiter({ limit, windowMs }: RateLimiterOptions) {
  const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
    analytics: true,
  });

  return {
    async check(key: string): Promise<RateLimitResult> {
      const { success, remaining } = await ratelimit.limit(key);
      return { success, remaining };
    },
  };
}

export function createRateLimiter(options: RateLimiterOptions) {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return createUpstashLimiter(options);
  }
  return createInMemoryLimiter(options);
}
