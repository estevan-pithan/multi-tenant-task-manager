import { describe, it, expect } from "vitest";
import { HTTPException } from "hono/http-exception";
import { createTaskService } from "../task.service";

function createMockRepository() {
  return {
    findAllByTenant: async (tenantId: string) => [
      { id: "1", title: "Task 1", status: "pending", tenantId },
    ],
    create: async (data: { title: string; status?: string; tenantId: string }) => ({
      id: "new-id",
      ...data,
      status: data.status ?? "pending",
    }),
    delete: async (_id: string, _tenantId: string) =>
      ({ id: _id, title: "Task", status: "pending", tenantId: _tenantId }) as any,
  };
}

describe("taskService", () => {
  it("list() returns tasks from repository", async () => {
    const repo = createMockRepository();
    const service = createTaskService(repo as any);

    const tasks = await service.list("tenant_a");

    expect(tasks).toHaveLength(1);
    expect(tasks[0].tenantId).toBe("tenant_a");
  });

  it("create() passes input and tenantId to repository", async () => {
    const repo = createMockRepository();
    const service = createTaskService(repo as any);

    const task = await service.create({ title: "New Task" }, "tenant_b");

    expect(task.title).toBe("New Task");
    expect(task.tenantId).toBe("tenant_b");
  });

  it("delete() returns the deleted task", async () => {
    const repo = createMockRepository();
    const service = createTaskService(repo as any);

    const task = await service.delete("1", "tenant_a");

    expect(task.id).toBe("1");
  });

  it("delete() throws 404 when task is not found", async () => {
    const repo = createMockRepository();
    repo.delete = async () => null;
    const service = createTaskService(repo as any);

    try {
      await service.delete("nonexistent", "tenant_a");
      expect.fail("Should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(HTTPException);
      expect((err as HTTPException).status).toBe(404);
    }
  });
});
