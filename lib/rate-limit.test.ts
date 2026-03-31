import { describe, expect, it } from "vitest";

import { createRateLimiter } from "@/lib/rate-limit";

describe("createRateLimiter (in-memory fallback)", () => {
  it("allows requests under the limit", async () => {
    const limiter = createRateLimiter({ limit: 3, windowMs: 10_000 });
    expect((await limiter.check("ip1")).success).toBe(true);
    expect((await limiter.check("ip1")).success).toBe(true);
    expect((await limiter.check("ip1")).success).toBe(true);
  });

  it("blocks requests over the limit", async () => {
    const limiter = createRateLimiter({ limit: 2, windowMs: 10_000 });
    await limiter.check("ip1");
    await limiter.check("ip1");
    expect((await limiter.check("ip1")).success).toBe(false);
    expect((await limiter.check("ip1")).remaining).toBe(0);
  });

  it("tracks IPs independently", async () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 10_000 });
    await limiter.check("ip1");
    expect((await limiter.check("ip1")).success).toBe(false);
    expect((await limiter.check("ip2")).success).toBe(true);
  });

  it("returns correct remaining count", async () => {
    const limiter = createRateLimiter({ limit: 3, windowMs: 10_000 });
    expect((await limiter.check("ip1")).remaining).toBe(2);
    expect((await limiter.check("ip1")).remaining).toBe(1);
    expect((await limiter.check("ip1")).remaining).toBe(0);
  });
});
