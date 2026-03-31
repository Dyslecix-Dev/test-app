import { beforeEach, describe, expect, it } from "vitest";

import { useTaskStore } from "@/lib/stores/task-store";

describe("useTaskStore", () => {
  beforeEach(() => {
    useTaskStore.setState({ viewMode: "list" });
  });

  it("defaults to list view mode", () => {
    expect(useTaskStore.getState().viewMode).toBe("list");
  });

  it("switches to kanban view mode", () => {
    useTaskStore.getState().setViewMode("kanban");
    expect(useTaskStore.getState().viewMode).toBe("kanban");
  });

  it("switches back to list view mode", () => {
    useTaskStore.getState().setViewMode("kanban");
    useTaskStore.getState().setViewMode("list");
    expect(useTaskStore.getState().viewMode).toBe("list");
  });
});
