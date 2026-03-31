import { describe, expect, it } from "vitest";

import { projects } from "@/lib/db/schema/projects";

describe("projects schema", () => {
  it("exports a projects table with the correct column names", () => {
    const cols = Object.keys(projects);
    expect(cols).toContain("id");
    expect(cols).toContain("userId");
    expect(cols).toContain("name");
    expect(cols).toContain("description");
    expect(cols).toContain("color");
    expect(cols).toContain("createdAt");
    expect(cols).toContain("updatedAt");
  });
});
