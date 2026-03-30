import { describe, expect, it } from "vitest";
import { z } from "zod/v4";

// NOTE: mirror of profileSchema from actions.ts — tested independently to avoid importing server-only dependencies (@conform-to/zod, Supabase, Drizzle).
const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
});

describe("profileSchema", () => {
  it("accepts a valid name", () => {
    const result = profileSchema.safeParse({ name: "Alice" });
    expect(result.success).toBe(true);
  });

  it("rejects an empty name", () => {
    const result = profileSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a name exceeding 100 characters", () => {
    const result = profileSchema.safeParse({ name: "a".repeat(101) });
    expect(result.success).toBe(false);
  });

  it("accepts a name at the 100 character limit", () => {
    const result = profileSchema.safeParse({ name: "a".repeat(100) });
    expect(result.success).toBe(true);
  });

  it("rejects missing name field", () => {
    const result = profileSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
