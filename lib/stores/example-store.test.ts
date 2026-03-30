import { beforeEach, describe, expect, it } from "vitest";

import { useExampleStore } from "@/lib/stores/example-store";

describe("useExampleStore", () => {
  beforeEach(() => {
    useExampleStore.setState({ count: 0 });
  });

  it("initial count is 0", () => {
    expect(useExampleStore.getState().count).toBe(0);
  });

  it("increment increases count by 1", () => {
    useExampleStore.getState().increment();
    expect(useExampleStore.getState().count).toBe(1);
  });

  it("decrement decreases count by 1", () => {
    useExampleStore.getState().decrement();
    expect(useExampleStore.getState().count).toBe(-1);
  });

  it("reset sets count to 0", () => {
    useExampleStore.getState().increment();
    useExampleStore.getState().increment();
    expect(useExampleStore.getState().count).toBe(2);
    useExampleStore.getState().reset();
    expect(useExampleStore.getState().count).toBe(0);
  });
});
