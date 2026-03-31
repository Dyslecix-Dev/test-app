import { parseWithZod } from "@conform-to/zod/v4";
import { describe, expect, it } from "vitest";

import { projectSchema } from "@/app/protected/projects/actions";

function makeFormData(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  return fd;
}

describe("projectSchema", () => {
  it("accepts a valid project payload", () => {
    const result = parseWithZod(makeFormData({ name: "My Project", color: "#6366f1" }), { schema: projectSchema });
    expect(result.status).toBe("success");
  });

  it("rejects an empty name", () => {
    const result = parseWithZod(makeFormData({ name: "", color: "#6366f1" }), { schema: projectSchema });
    expect(result.status).toBe("error");
  });

  it("rejects a name longer than 80 characters", () => {
    const result = parseWithZod(makeFormData({ name: "a".repeat(81), color: "#6366f1" }), { schema: projectSchema });
    expect(result.status).toBe("error");
  });

  it("rejects an invalid hex color", () => {
    const result = parseWithZod(makeFormData({ name: "Valid", color: "notacolor" }), { schema: projectSchema });
    expect(result.status).toBe("error");
  });

  it("accepts an optional description", () => {
    const result = parseWithZod(makeFormData({ name: "My Project", description: "Some details", color: "#ffffff" }), { schema: projectSchema });
    expect(result.status).toBe("success");
    if (result.status === "success") {
      expect(result.value.description).toBe("Some details");
    }
  });
});
