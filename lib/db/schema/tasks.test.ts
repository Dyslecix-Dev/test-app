import { describe, expect, it } from "vitest";

import { taskPriorityEnum, tasks, taskStatusEnum } from "@/lib/db/schema/tasks";

describe("tasks schema", () => {
  it("exports a tasks table with the correct column names", () => {
    const cols = Object.keys(tasks);
    expect(cols).toContain("id");
    expect(cols).toContain("projectId");
    expect(cols).toContain("assigneeId");
    expect(cols).toContain("title");
    expect(cols).toContain("description");
    expect(cols).toContain("status");
    expect(cols).toContain("priority");
    expect(cols).toContain("dueDate");
    expect(cols).toContain("attachmentUrl");
    expect(cols).toContain("createdAt");
    expect(cols).toContain("updatedAt");
  });

  it("taskStatusEnum includes all expected statuses", () => {
    expect(taskStatusEnum.enumValues).toEqual(["todo", "in_progress", "in_review", "done"]);
  });

  it("taskPriorityEnum includes all expected priorities", () => {
    expect(taskPriorityEnum.enumValues).toEqual(["low", "medium", "high", "urgent"]);
  });
});
