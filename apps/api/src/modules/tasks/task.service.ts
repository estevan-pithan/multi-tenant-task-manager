import type { createTaskRepository } from "./task.repository";
import type { CreateTaskInput } from "./task.schema";
import { HTTPException } from "hono/http-exception";

type TaskRepository = ReturnType<typeof createTaskRepository>;

export function createTaskService(repository: TaskRepository) {
  return {
    async list(tenantId: string) {
      return repository.findAllByTenant(tenantId);
    },

    async create(input: CreateTaskInput, tenantId: string) {
      return repository.create({ ...input, tenantId });
    },

    async delete(id: string, tenantId: string) {
      const task = await repository.delete(id, tenantId);
      if (!task) {
        throw new HTTPException(404, { message: "Task not found" });
      }
      return task;
    },
  };
}
