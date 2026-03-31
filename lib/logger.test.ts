import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("logger", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it("logger.info calls console.log", async () => {
    const { logger } = await import("@/lib/logger");
    logger.info("hello");
    expect(console.log).toHaveBeenCalled();
  });

  it("logger.error calls console.error", async () => {
    const { logger } = await import("@/lib/logger");
    logger.error("something broke");
    expect(console.error).toHaveBeenCalled();
  });

  it("logger.warn calls console.warn", async () => {
    const { logger } = await import("@/lib/logger");
    logger.warn("careful");
    expect(console.warn).toHaveBeenCalled();
  });

  it("meta is included in output", async () => {
    const { logger } = await import("@/lib/logger");
    logger.info("with meta", { userId: "123" });
    const output = vi.mocked(console.log).mock.calls[0][0] as string;
    expect(output).toContain("userId");
    expect(output).toContain("123");
  });

  it("outputs JSON in production mode", async () => {
    vi.stubEnv("NODE_ENV", "production");

    const { logger } = await import("@/lib/logger");
    logger.info("prod message", { key: "value" });

    const output = vi.mocked(console.log).mock.calls[0][0] as string;
    const parsed = JSON.parse(output);
    expect(parsed.level).toBe("info");
    expect(parsed.message).toBe("prod message");
    expect(parsed.key).toBe("value");
    expect(parsed.timestamp).toBeDefined();

    vi.unstubAllEnvs();
  });
});
