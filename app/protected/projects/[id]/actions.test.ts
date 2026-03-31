import { parseWithZod } from "@conform-to/zod/v4";
import { describe, expect, it } from "vitest";

import { taskSchema } from "@/app/protected/projects/[id]/actions";

function makeFormData(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  return fd;
}

describe("taskSchema", () => {
  it("accepts a minimal valid task", () => {
    const result = parseWithZod(makeFormData({ title: "Fix the bug" }), { schema: taskSchema });
    expect(result.status).toBe("success");
  });

  it("defaults status to todo and priority to medium", () => {
    const result = parseWithZod(makeFormData({ title: "My task" }), { schema: taskSchema });
    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.value.status).toBe("todo");
      expect(result.value.priority).toBe("medium");
    }
  });

  it("rejects an empty title", () => {
    const result = parseWithZod(makeFormData({ title: "" }), { schema: taskSchema });
    expect(result.status).toBe("error");
  });

  it("rejects a title longer than 200 characters", () => {
    const result = parseWithZod(makeFormData({ title: "x".repeat(201) }), { schema: taskSchema });
    expect(result.status).toBe("error");
  });

  it("accepts all valid statuses", () => {
    for (const status of ["todo", "in_progress", "in_review", "done"]) {
      const result = parseWithZod(makeFormData({ title: "Task", status }), { schema: taskSchema });
      expect(result.status).toBe("success");
    }
  });

  it("accepts all valid priorities", () => {
    for (const priority of ["low", "medium", "high", "urgent"]) {
      const result = parseWithZod(makeFormData({ title: "Task", priority }), { schema: taskSchema });
      expect(result.status).toBe("success");
    }
  });

  it("rejects an invalid status", () => {
    const result = parseWithZod(makeFormData({ title: "Task", status: "blocked" }), { schema: taskSchema });
    expect(result.status).toBe("error");
  });

  it("rejects a malformed assigneeId", () => {
    const result = parseWithZod(makeFormData({ title: "Task", assigneeId: "not-a-uuid" }), { schema: taskSchema });
    expect(result.status).toBe("error");
  });

  it("accepts a valid UUID assigneeId", () => {
    const result = parseWithZod(makeFormData({ title: "Task", assigneeId: "123e4567-e89b-12d3-a456-426614174000" }), { schema: taskSchema });
    expect(result.status).toBe("success");
  });
});
