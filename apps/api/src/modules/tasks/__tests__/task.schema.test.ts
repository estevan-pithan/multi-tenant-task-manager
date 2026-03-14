import { describe, it, expect } from "vitest";
import { createTaskSchema } from "../task.schema";

describe("createTaskSchema", () => {
  it("validates a correct input with title only", () => {
    const result = createTaskSchema.safeParse({ title: "My Task" });
    expect(result.success).toBe(true);
  });

  it("validates a correct input with title and status", () => {
    const result = createTaskSchema.safeParse({
      title: "My Task",
      status: "in_progress",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty title", () => {
    const result = createTaskSchema.safeParse({ title: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a title longer than 255 characters", () => {
    const result = createTaskSchema.safeParse({ title: "a".repeat(256) });
    expect(result.success).toBe(false);
  });

  it("accepts all valid status values", () => {
    for (const status of ["pending", "in_progress", "done"]) {
      const result = createTaskSchema.safeParse({ title: "Task", status });
      expect(result.success).toBe(true);
    }
  });

  it("rejects an invalid status", () => {
    const result = createTaskSchema.safeParse({
      title: "Task",
      status: "invalid",
    });
    expect(result.success).toBe(false);
  });

  it("accepts input without status (optional)", () => {
    const result = createTaskSchema.safeParse({ title: "Task" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBeUndefined();
    }
  });
});
