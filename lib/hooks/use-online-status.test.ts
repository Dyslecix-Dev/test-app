import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { useOnlineStatus } from "@/lib/hooks/use-online-status";

const originalOnLine = navigator.onLine;

describe("useOnlineStatus", () => {
  afterEach(() => {
    Object.defineProperty(navigator, "onLine", { value: originalOnLine, configurable: true, writable: true });
  });

  it("returns true when navigator.onLine is true", () => {
    Object.defineProperty(navigator, "onLine", { value: true, configurable: true, writable: true });
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);
  });

  it("returns false when navigator.onLine is false", () => {
    Object.defineProperty(navigator, "onLine", { value: false, configurable: true, writable: true });
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(false);
  });
});
